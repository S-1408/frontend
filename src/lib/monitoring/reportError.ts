import type { ErrorInfo } from "react";
import * as Sentry from "@sentry/react";
import { getErrorSection } from "./errorSection";

interface ReportErrorInfo extends Partial<Pick<ErrorInfo, "componentStack">> {
  // Where the error came from, e.g. "query" | "mutation"; becomes a searchable Sentry tag
  source?: string;
  // Extra debugging data, e.g. the React Query key
  extra?: Record<string, unknown>;
}

// Single place every error is reported from, backed by Sentry. Components,
// boundaries and API layers call this instead of Sentry directly, so the
// monitoring vendor can be swapped without touching them.
export const reportError = (error: unknown, info?: ReportErrorInfo) => {
  // Set when a named SectionErrorBoundary caught this error
  const section = getErrorSection(error);

  if (import.meta.env.DEV) {
    console.error("[reportError]", section ?? "", error, info?.componentStack ?? "", info?.extra ?? "");
  }
  // No-op when Sentry isn't initialised (no VITE_SENTRY_DSN), e.g. in tests
  Sentry.captureException(error, {
    tags: {
      ...(info?.source && { source: info.source }),
      ...(section && { section }),
    },
    extra: info?.extra,
    contexts: { react: { componentStack: info?.componentStack ?? null } },
  });
};
