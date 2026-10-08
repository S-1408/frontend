import type { ApplicationFilters } from "../types";

// Single source of truth for application query keys, so queries and
// cache invalidations can never drift apart.
export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters: ApplicationFilters) => [...applicationKeys.lists(), filters] as const,
  // "detail" segment so an id can never collide with "list"
  detail: (id: string) => [...applicationKeys.all, "detail", id] as const,
};
