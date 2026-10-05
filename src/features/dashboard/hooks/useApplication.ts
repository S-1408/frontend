import { useQuery } from "@tanstack/react-query"
import { getApplications } from "../../applications/api/application.api"
import { applicationKeys } from "../../applications/api/queryKeys"

export const useApplication=()=>{
  return useQuery({
    queryKey:applicationKeys.all,
    queryFn:getApplications
  })
}
