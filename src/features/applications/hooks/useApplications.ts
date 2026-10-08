import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getApplications } from "../api/application.api";
import { applicationKeys } from "../api/queryKeys";
import type { ApplicationFilters } from "../types";

// The applications list. Owned by the applications feature; other features
// (e.g. the dashboard) import it from here.

export const useApplications = (filters: ApplicationFilters = {}) =>
  useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: ({ signal }) => getApplications(filters, signal),
    placeholderData: keepPreviousData, // keep showing the old rows while new results load
  });
