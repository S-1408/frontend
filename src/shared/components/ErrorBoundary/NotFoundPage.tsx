import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <h2 className="text-xl font-semibold text-gray-900">Page not found</h2>
      <p className="text-sm text-gray-600">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
