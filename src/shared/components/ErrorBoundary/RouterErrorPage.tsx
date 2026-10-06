import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import { getErrorMessage } from "./getErrorMessage";

// Rendered by React Router's errorElement when a route crashes while rendering
const RouterErrorPage = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 p-12 text-center"
    >
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="text-sm text-gray-600">
        This page failed to load. You can try again or head back to the dashboard.
      </p>
      {/* Never show raw error details to production users */}
      {import.meta.env.DEV && (
        <pre className="max-w-xl overflow-auto rounded-lg bg-red-50 p-3 text-left text-xs text-red-700">
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : getErrorMessage(error)}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-xl bg-indigo-300 px-3 py-2 transition hover:bg-indigo-500"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
        <Link
          to="/"
          className="rounded-xl bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default RouterErrorPage;
