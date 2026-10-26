import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Do not redirect while startup is checking whether the refresh cookie can restore the session.
  if (isInitializing) {
    return <main role="status">Restoring your session...</main>;
  }

  if (!isAuthenticated) {
    // Preserve the requested URL so a successful login can return the user there.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
