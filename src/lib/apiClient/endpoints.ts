// Keep backend API paths in one place; apiClient adds the configured base URL.
export const API_ENDPOINTS = {
  auth: {
    base: "/auth",
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  applications: {
    collection: "/applications",
    byId: (id: string) => `/applications/${encodeURIComponent(id)}`,
  },
  dashboard: {
    stats: "/dashboard/stats",
  },
} as const;
