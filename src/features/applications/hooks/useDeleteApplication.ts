import { useMutation, useQueryClient } from "@tanstack/react-query"
import  { deleteApplication } from "../api/application.api"
import { applicationKeys } from "../api/queryKeys";
// Hook-level callbacks handle data logic:
//  cache invalidation, optimistic updates.
//  They always run, even if the component unmounts.

export const useDeleteApplication =()=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:deleteApplication,
        meta:{errorMessage:"Couldn't delete application."},
        onSettled:()=>queryClient.invalidateQueries({queryKey:applicationKeys.all})
})
}

