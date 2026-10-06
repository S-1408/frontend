import type { FallbackProps } from "react-error-boundary";
import { getErrorMessage } from "./getErrorMessage";

// Last-resort screen when the app shell itself crashes. Uses plain markup and
// no router/query hooks, because those providers may be what broke.
const AppCrashFallback = ({ error }: FallbackProps) => {
  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center"
    >
      <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="max-w-md text-sm text-gray-600">
        JobTrackr hit an unexpected error. Reloading the page usually fixes it.
      </p>
      {import.meta.env.DEV && (
        <pre className="max-w-xl overflow-auto rounded-lg bg-red-50 p-3 text-left text-xs text-red-700">
          {getErrorMessage(error)}
        </pre>
      )}
      <button
        type="button"
        className="rounded-xl bg-indigo-300 px-4 py-2 transition hover:bg-indigo-500"
        onClick={() => window.location.reload()}
      >
        Reload page
      </button>
    </div>
  );
};

export default AppCrashFallback;

