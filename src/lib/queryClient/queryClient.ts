import { MutationCache, QueryCache, QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { toast } from "sonner";
import { reportError } from "../monitoring/reportError";
import { getApiErrorMessage } from "../apiClient/getApiErrorMessage";
import { isExpectedApiError } from "../apiClient/isExpectedApiError";

// Per-mutation options, read by the global onError below.
// Usage: useMutation({ mutationFn, meta: { errorMessage: "Couldn't delete application." } })
declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      // Fallback toast text when the server sends no message
      errorMessage?: string;
      // Set when the UI already shows the error inline (e.g. inside a form modal),
      // so the user doesn't see the same message twice
      suppressErrorToast?: boolean;
    };
  }
}

// Cache-level onError fires once per failed query/mutation (after retries) for
// EVERY hook, so individual hooks don't need their own error handling:
// - unexpected failures (5xx, timeouts) are reported to Sentry; expected ones
//   (4xx, offline) are only shown to the user, see isExpectedApiError
// - every failed mutation shows an error toast unless the UI handles it inline
// - a failed background refetch toasts, because the stale data stays on screen
//   and the user would otherwise never know. A first-load failure doesn't, as
//   the component renders its own error state (isError) instead.
export function createQueryClient(config: QueryClientConfig = {}) {
  return new QueryClient({
    ...config,
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!isExpectedApiError(error)) {
          reportError(error, { source: "query", extra: { queryKey: query.queryKey } });
        }
        if (query.state.data !== undefined) {
          toast.error(getApiErrorMessage(error, "Couldn't refresh data. Showing the last saved version."));
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!isExpectedApiError(error)) {
          reportError(error, { source: "mutation", extra: { mutationKey: mutation.options.mutationKey } });
        }
        const meta = mutation.meta;
        if (!meta?.suppressErrorToast) {
          toast.error(getApiErrorMessage(error, meta?.errorMessage));
        }
      },
    }),
  });
}
