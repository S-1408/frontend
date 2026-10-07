import { Suspense, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import SectionErrorFallback from "./SectionErrorFallback";
import { tagErrorSection } from "../../../lib/monitoring/errorSection";

interface SectionBoundaryProps {
  children: ReactNode;
  // Stable id tagged on the Sentry event ("section: application-list"), so you
  // can see which part of the app fails most. Not shown to users.
  name: string;
  // User-facing message in the fallback card
  title?: string;
  // Pass a skeleton when children use useSuspenseQuery / lazy(). The boundary
  // sits OUTSIDE Suspense, so it catches both failed loads and render crashes,
  // and Retry shows the skeleton again while refetching.
  loadingFallback?: ReactNode;
}

// Wrap independent widgets with this. QueryErrorResetBoundary makes
// "Try again" also reset failed React Query queries so they refetch instead
// of re-throwing the cached error.
const SectionBoundary = ({ children, name, title, loadingFallback }: SectionBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={(props) => {
            // Tags the error before React reports it (see errorSection.ts).
            // No onError here: the root onCaughtError already reports it once.
            tagErrorSection(props.error, name);
            return <SectionErrorFallback {...props} title={title} />;
          }}
        >
          {loadingFallback === undefined ? (
            children
          ) : (
            <Suspense fallback={loadingFallback}>{children}</Suspense>
          )}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default SectionBoundary;
