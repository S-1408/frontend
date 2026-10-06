import type { FallbackProps } from "react-error-boundary";
import { getErrorMessage } from "./getErrorMessage";

interface SectionErrorFallbackProps extends FallbackProps {
  title?: string;
}

// Compact inline card so one broken widget doesn't take down the whole page
const SectionErrorFallback = ({
  error,
  resetErrorBoundary,
  title = "This section couldn't be displayed.",
}: SectionErrorFallbackProps) => {
  return (
    <div
      role="alert"
      className="m-6 flex flex-col items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4"
    >
      <p className="text-sm font-medium text-red-700">{title}</p>
      {import.meta.env.DEV && (
        <p className="text-xs text-red-600">{getErrorMessage(error)}</p>
      )}
      <button
        type="button"
        className="rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
};

export default SectionErrorFallback;
