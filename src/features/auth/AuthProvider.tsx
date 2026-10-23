import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getApiErrorMessage } from "../../lib/apiClient/getApiErrorMessage";
import { isInvalidRefreshSessionError } from "../../lib/apiClient/apiClient";
import {
  getCurrentUser,
  login as requestLogin,
  logout as requestLogout,
  refreshAccessToken,
  type AuthUser,
} from "./auth.api";
import { AuthContext, type AuthContextValue } from "./authContext";
import {
  clearAccessToken,
  getAccessToken,
  getAuthSessionVersion,
  setAccessToken,
  subscribeToAccessToken,
} from "./authTokens";

export function AuthProvider({ children }: { children: ReactNode }) {
  // A reload clears the in-memory token, so routes wait while the cookie-backed session is restored.
  const [isInitializing, setIsInitializing] = useState(() => !getAccessToken());
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [canRetryInitialization, setCanRetryInitialization] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const queryClient = useQueryClient();
  const accessToken = useSyncExternalStore(
    subscribeToAccessToken,
    getAccessToken,
    () => null,
  );
  const restorePromise = useRef<Promise<string | null> | null>(null);
  const restoreSession = useCallback((): Promise<string | null> => {
    if (restorePromise.current) {
      return restorePromise.current;
    }

    const promise = (async (): Promise<string | null> => {
      let sessionVersion = getAuthSessionVersion();
      try {
        if (!getAccessToken()) {
          await refreshAccessToken();
          sessionVersion = getAuthSessionVersion();
        }
        const currentUser = await getCurrentUser();
        if (sessionVersion === getAuthSessionVersion()) {
          setUser(currentUser);
          setInitializationError(null);
          setCanRetryInitialization(false);
        }
        return null;
      } catch (error) {
        // Do not clear a newer login/logout state because an older restore request failed late.
        if (sessionVersion === getAuthSessionVersion()) {
          if (isInvalidRefreshSessionError(error)) {
            clearAccessToken();
            setUser(null);
            queryClient.clear();
            setCanRetryInitialization(false);
          } else {
            setCanRetryInitialization(true);
          }
        }
        // Keep temporary outages distinct from invalid sessions so users can retry restoration.
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            return getApiErrorMessage(error, "Your session has expired or is invalid. Please sign in.");
          }
          if (error.response && error.response.status >= 500) {
            return getApiErrorMessage(error, "Session restoration is temporarily unavailable. Please try again.");
          }
          if (!error.response) {
            return getApiErrorMessage(error, "Unable to reach the server. Check your connection and try again.");
          }
        }
        return getApiErrorMessage(error, "The session service returned an invalid response. Please try again.");
      }
    })();
    restorePromise.current = promise;
    void promise.then(() => {
      if (restorePromise.current === promise) {
        restorePromise.current = null;
      }
    });
    return promise;
  }, [queryClient]);
  const retryInitialization = useCallback(async () => {
    setIsInitializing(true);
    setInitializationError(null);
    setCanRetryInitialization(false);
    setInitializationError(await restoreSession());
    setIsInitializing(false);
  }, [restoreSession]);

  useEffect(() => {
    if (getAccessToken()) {
      let active = true;
      void getCurrentUser().then(
        (currentUser) => {
          if (active) setUser(currentUser);
        },
        (error: unknown) => {
          if (active && isInvalidRefreshSessionError(error)) {
            clearAccessToken();
            setUser(null);
            queryClient.clear();
            setInitializationError(null);
            setCanRetryInitialization(false);
          }
        },
      );
      return () => {
        active = false;
      };
    }

    // This also runs during React Strict Mode; the API client shares the refresh promise.
    let active = true;
    void restoreSession().then((error) => {
      if (active) {
        setInitializationError(error);
        setIsInitializing(false);
      }
    });
    return () => {
      active = false;
    };
  }, [queryClient, restoreSession]);

  useEffect(() => {
    let hadAccessToken = Boolean(getAccessToken());
    const unsubscribe = subscribeToAccessToken(() => {
      const hasAccessToken = Boolean(getAccessToken());
      if (hadAccessToken && !hasAccessToken) {
        // Remove user-specific server state as soon as authentication ends.
        setUser(null);
        setInitializationError("Your session has expired or was revoked.");
        setCanRetryInitialization(false);
        queryClient.clear();
      }
      hadAccessToken = hasAccessToken;
    });
    return () => unsubscribe();
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    // Clear the previous account before authenticating, preventing cached data leakage.
    clearAccessToken();
    setUser(null);
    queryClient.clear();
    setInitializationError(null);
    setCanRetryInitialization(false);
    const result = await requestLogin(email, password);
    setAccessToken(result.accessToken);
    try {
      setUser(await getCurrentUser());
    } catch (error) {
      clearAccessToken();
      setUser(null);
      queryClient.clear();
      throw error;
    }
    setInitializationError(null);
  }, [queryClient]);

  const logout = useCallback(async () => {
    // Clear local auth immediately; the server call invalidates the cookie-backed session.
    clearAccessToken();
    setUser(null);
    queryClient.clear();
    setInitializationError(null);
    setCanRetryInitialization(false);
    await requestLogout();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken),
      user,
      isInitializing,
      initializationError,
      canRetryInitialization,
      retryInitialization,
      login,
      logout,
    }),
    [accessToken, canRetryInitialization, initializationError, isInitializing, login, logout, retryInitialization, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
