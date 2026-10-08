import { useSearchParams } from "react-router-dom";
import { APPLICATION_STATUS_OPTIONS } from "../constants/status";
import type { ApplicationFilters, ApplicationStatus } from "../types";
import { useMemo } from "react";

export const useApplicationFilters = (): ApplicationFilters => {
  const [params] = useSearchParams();
  const search = params.get("search") ?? "";
  const rawStatus = params.get("status");
  // Ignore unknown values typed into the URL
  const status = APPLICATION_STATUS_OPTIONS.some((o) => o.value === rawStatus)
    ? (rawStatus as ApplicationStatus)
    : undefined;
  return useMemo(() => ({ search: search || undefined, status }), [search, status]);
};
