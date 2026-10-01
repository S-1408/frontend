import { useQuery } from "@tanstack/react-query"
import { getApplications } from "../../applications/api/application"

export const useApplication=()=>{
  return useQuery({
    queryKey:['applications'],
    queryFn:getApplications
  })
}