import { apiClient } from "../../lib/apiClient/apiClient";
import { API_ENDPOINTS } from "../../lib/apiClient/endpoints";
import { isAccessToken, type AccessToken } from "./authTokens";
export { refreshAccessToken } from "../../lib/apiClient/apiClient";

export interface AuthUser {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

function parseCurrentUser(value: unknown): AuthUser {
  if (typeof value !== "object" || value === null) {
    throw new Error("The current-user response did not contain a user.");
  }

  const response = value as Record<string, unknown>;
  const user = typeof response.user === "object" && response.user !== null
    ? response.user as Record<string, unknown>
    : response;
  const parsed: AuthUser = {
    ...(typeof user.id === "string" || typeof user.id === "number" ? { id: String(user.id) } : {}),
    ...(typeof user.name === "string" ? { name: user.name } : {}),
    ...(typeof user.firstName === "string" ? { firstName: user.firstName } : {}),
    ...(typeof user.lastName === "string" ? { lastName: user.lastName } : {}),
    ...(typeof user.email === "string" ? { email: user.email } : {}),
  };

  if (!parsed.id && !parsed.name && !parsed.firstName && !parsed.lastName && !parsed.email) {
    throw new Error("The current-user response did not contain recognizable user details.");
  }
  return parsed;
}

export async function login(email: string, password: string): Promise<AccessToken> {
  // Validate the response because malformed credentials data must never authenticate the UI.
  const response = await apiClient.post<unknown>(API_ENDPOINTS.auth.login, { email, password });
  if (!isAccessToken(response.data)) {
    throw new Error("The login response did not contain a valid access token.");
  }
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  // This endpoint is protected and participates in the shared 401 refresh/retry flow.
  const response = await apiClient.get<unknown>(API_ENDPOINTS.auth.me, { _authRequired: true });
  return parseCurrentUser(response.data);
}

export async function logout(): Promise<void> {
  // The backend revokes the refresh session and clears its HttpOnly cookie.
  await apiClient.post(API_ENDPOINTS.auth.logout);
}
