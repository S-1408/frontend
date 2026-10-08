import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateApplication } from "../api/application.api";
import type { CreateApplicationPayload } from "../types";
import { applicationKeys } from "../api/queryKeys";

type UpdateVariables = { id: string; data: Partial<CreateApplicationPayload> };

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdateVariables) => updateApplication(id, data),
    // edit Form show the error in line , so skip the gloab toast
    meta: { suppressErrorToast: true },
    onSuccess: (updated) => {
      // Detail page shoes the new value instaly, no extra request
      queryClient.setQueryData(applicationKeys.detail(updated.id), updated);
    },
    // lists may be sorted/filttered by edited field so let the server decide
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
  });
};
