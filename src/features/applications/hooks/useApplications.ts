import { useQuery } from "@tanstack/react-query";
import { getApplications } from "../api/application.api";
import { applicationKeys } from "../api/queryKeys";

// The applications list. Owned by the applications feature; other features
// (e.g. the dashboard) import it from here.
export const useApplications = () =>
  useQuery({
    queryKey: applicationKeys.all,
    queryFn: getApplications,
  });
