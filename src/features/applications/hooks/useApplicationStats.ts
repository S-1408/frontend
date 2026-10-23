import { useQuery } from "@tanstack/react-query";
import { getApplicationStats } from "../api/application.api";
import { applicationKeys } from "../api/queryKeys";

export const useApplicationStats = () =>
  useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: ({ signal }) => getApplicationStats(signal),
  });
