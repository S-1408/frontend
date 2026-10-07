import { isAxiosError } from "axios";

// Expected = a normal state the UI already explains to the user, not a bug.
// These still show inline/toast messages, but are NOT sent to Sentry, so
// alerts only fire for real problems.
//   expected:   4xx (validation, not found, conflict, auth), offline/unreachable, cancelled
//   unexpected: 5xx, timeouts, and anything that isn't an API error (code bugs)
export function isExpectedApiError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (error.code === "ERR_CANCELED") return true;
  // Timeouts usually mean a slow or struggling backend, which is worth knowing about
  if (error.code === "ECONNABORTED") return false;
  // No response: the user is offline or the server is unreachable from their network
  if (!error.response) return true;
  const { status } = error.response;
  return status >= 400 && status < 500;
}
