import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplication } from "../api/application.api";
import { applicationKeys } from "../api/queryKeys";

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApplication,
    // Refetch the list so the new application shows up without a page reload
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
  });
};
