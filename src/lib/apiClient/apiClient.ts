import axios from "axios";
import { API_ENDPOINTS } from "./endpoints";
import {
  clearAccessToken,
  getAccessToken,
  getAuthSessionVersion,
  isAccessToken,
  updateAccessToken,
  type AccessToken,
} from "../../features/auth/authTokens";

export class InvalidRefreshAccessTokenError extends Error {
  constructor() {
    super("The refresh response did not contain a valid access token.");
    this.name = "InvalidRefreshAccessTokenError";
  }
}

export function isInvalidRefreshSessionError(error: unknown): boolean {
  if (error instanceof InvalidRefreshAccessTokenError) {
    return true;
  }
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const data = error.response?.data as { code?: unknown; message?: unknown } | undefined;
  const code = typeof data?.code === "string" ? data.code.toUpperCase() : "";
  if (
    error.response?.status === 401
    || ["REFRESH_TOKEN_REVOKED", "REFRESH_TOKEN_EXPIRED", "REFRESH_TOKEN_INVALID", "SESSION_REVOKED"].includes(code)
  ) {
    return true;
  }

  return typeof data?.message === "string"
    && /refresh token (?:has been )?(?:revoked|expired|invalid)/i.test(data.message);
}

// Used to reject refresh results that arrive after logout or an account change.
export class AuthSessionChangedError extends Error {
  constructor() {
    super("The authentication session changed while refreshing the access token.");
    this.name = "AuthSessionChangedError";
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  // Sends the backend-managed HttpOnly refresh cookie; JavaScript never reads that cookie.
  withCredentials: true,
});

// Axios runs this function before sending each request made through apiClient
// and The interceptor gets the request configuration before it goes to the backend.
apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken(); // This reads the access token from your authentication store.

// /auth/me is protected; other auth endpoints must not receive a bearer token.
  const isAuthEndpoint = (config.url?.startsWith(`${API_ENDPOINTS.auth.base}/`) ?? false)
    && config.url !== API_ENDPOINTS.auth.me;
  if (config._authRequired && config._authSessionVersion === undefined) {
    // Bind each protected request to the session that sent it so late 401s from
    // a failed refresh cannot start another refresh after that session is cleared.
    config._authSessionVersion = getAuthSessionVersion();
  }
  // Attach bearer credentials only to explicitly protected, non-auth endpoints.
  if (accessToken && config._authRequired && !isAuthEndpoint) { // Decide whether to attach the token
    // If all conditions pass, Axios adds the header:
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config; // This is important. It allows Axios to continue sending the request with the updated headers.
});

let refreshPromise: Promise<AccessToken> | null = null;

export function refreshAccessToken(): Promise<AccessToken> {
  if (!refreshPromise) {
    // Share one refresh across simultaneous 401s to avoid redundant cookie rotation.
    const sessionVersion = getAuthSessionVersion();
    refreshPromise = apiClient
      .post<unknown>(API_ENDPOINTS.auth.refresh)
      .then((response) => {
        if (!isAccessToken(response.data)) {
          throw new InvalidRefreshAccessTokenError();
        }
        if (sessionVersion !== getAuthSessionVersion()) {
          throw new AuthSessionChangedError();
        }
        updateAccessToken(response.data.accessToken);
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Only authenticated 401s may refresh; network errors, cancellations, public calls,
    // auth endpoints, and 403 permission failures must not enter this flow.
    if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
      return Promise.reject(error);
    }

    const request = error.config;
    // Allow /auth/me into refresh/retry while excluding login, refresh, and logout.
    const isAuthEndpoint = (request.url?.startsWith(`${API_ENDPOINTS.auth.base}/`) ?? false)
      && request.url !== API_ENDPOINTS.auth.me;
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }
    if (request._authRetry) {
      // A second 401 ends this retry cycle and clears only the session that issued it.
      if (request._authSessionVersion === getAuthSessionVersion()) {
        clearAccessToken();
      }
      return Promise.reject(error);
    }

    if (!request._authRequired) {
      return Promise.reject(error);
    }

    const currentAccessToken = getAccessToken();
    const requestAuthorization = request.headers.get("Authorization");
    if (currentAccessToken && requestAuthorization !== `Bearer ${currentAccessToken}`) {
      // Another request may already have refreshed; use that newer token.
      request._authRetry = true;
      request._authSessionVersion = getAuthSessionVersion();
      request.headers.set("Authorization", `Bearer ${currentAccessToken}`);
      return apiClient(request);
    }

    if (request._authSessionVersion !== getAuthSessionVersion()) {
      // The original session ended; reject its late response without refreshing again.
      return Promise.reject(error);
    }

    const responseCode = (error.response.data as { code?: unknown } | undefined)?.code;
    if (typeof responseCode === "string" && responseCode !== "ACCESS_TOKEN_EXPIRED") {
      if (responseCode === "SESSION_REVOKED" || responseCode === "ACCOUNT_DISABLED") {
        clearAccessToken();
      }
      return Promise.reject(error);
    }

    const sessionVersion = getAuthSessionVersion();
    // Mark the request before retrying so a second 401 cannot start an infinite loop.
    request._authRetry = true;

    try {
      const tokens = await refreshAccessToken();
      if (getAccessToken() !== tokens.accessToken) {
        return Promise.reject(error);
      }
      request._authSessionVersion = getAuthSessionVersion();
      request.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
      return apiClient(request);
    } catch (refreshError) {
      if (
        sessionVersion === getAuthSessionVersion()
        && isInvalidRefreshSessionError(refreshError)
      ) {
        clearAccessToken();
      }
      return Promise.reject(refreshError);
    }
  },
);

declare module "axios" {
  interface AxiosRequestConfig {
    _authRequired?: boolean;
  }

  interface InternalAxiosRequestConfig {
    _authRequired?: boolean;
    _authRetry?: boolean;
    _authSessionVersion?: number;
  }
}
