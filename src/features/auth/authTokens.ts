export interface AccessToken {
  accessToken: string;
}

// Validate untrusted login/refresh response data before accepting it as a session token.
export function isAccessToken(value: unknown): value is AccessToken {
  if (typeof value !== "object" || value === null) return false;
  const token = value as Record<string, unknown>;
  return typeof token.accessToken === "string" && token.accessToken.length > 0;
}

let accessToken: string | null = null;
// Changes invalidate in-flight refresh results so logout/account switches cannot be undone.
let authSessionVersion = 0;
const listeners = new Set<() => void>();

export function getAccessToken() {
  return accessToken;
}

export function getAuthSessionVersion() {
  return authSessionVersion;
}

export function setAccessToken(nextToken: string) {
  accessToken = nextToken;
  authSessionVersion += 1;
  // Notify React subscribers so auth guards and UI update immediately.
  listeners.forEach((listener) => listener());
}

export function updateAccessToken(nextToken: string) {
  accessToken = nextToken;
  listeners.forEach((listener) => listener());
}

export function clearAccessToken() {
  accessToken = null;
  authSessionVersion += 1;
  // Bump the version even when clearing: pending requests must not restore stale auth.
  listeners.forEach((listener) => listener());
}

// Keep the token in memory only; listeners let React observe it without persistent storage.
export function subscribeToAccessToken(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
