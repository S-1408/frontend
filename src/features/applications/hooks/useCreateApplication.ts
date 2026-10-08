import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplication } from "../api/application.api";
import { applicationKeys } from "../api/queryKeys";

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  //useQueryClient() returns the QueryClient you created in main.tsx and passed to <QueryClientProvider>
  // It's the object that holds the cache.

  return useMutation({
    mutationFn: createApplication,
    // The Add Application modal shows this error inline next to the form, so
    // skip the global error toast. It is still reported to Sentry.
    meta: { suppressErrorToast: true },
    // Refetch the list so the new application shows up without a page reload
    //Once the POST succeeds, invalidateQueries marks every query whose key starts with ["applications"] as stale.
    // ApplicationList re-renders with the new row, without a page reload.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
  });
};
