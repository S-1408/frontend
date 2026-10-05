import { isAxiosError } from "axios";

// Turns any thrown error into a message that is safe to show to the user.
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (!error.response) return "Unable to reach the server. Check your connection.";
    return error.response.data?.message ?? fallback;
  }
  return fallback;
}
