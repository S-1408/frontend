// Single source of truth for application query keys, so queries and
// cache invalidations can never drift apart.
export const applicationKeys = {
  all: ["applications"] as const,
  detail: (id: string) => [...applicationKeys.all, id] as const,
};
