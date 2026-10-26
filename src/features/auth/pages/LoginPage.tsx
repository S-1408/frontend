import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../lib/apiClient/getApiErrorMessage";
import { useAuth } from "../authContext";

interface LoginPageFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const {
    login,
    isAuthenticated,
    isInitializing,
    initializationError,
    canRetryInitialization,
    retryInitialization,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPageFormData>({
    defaultValues: { email: "", password: "" },
  });
  const previousPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  // Accept only same-origin app paths to avoid redirecting users to an external site after login.
  const returnTo = previousPath?.startsWith("/") && !previousPath.startsWith("//") ? previousPath : "/";

  if (isInitializing) {
    // Match protected-route behavior while the cookie-backed session is being restored.
    return <main role="status">Restoring your session...</main>;
  }

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const onSubmit = async ({ email, password }: LoginPageFormData) => {
    setSubmitError("");
    try {
      await login(email, password);
      // Go back to the protected URL that originally sent the user to sign in.
      navigate(returnTo, { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to sign in. Please try again."));
    }
  };

  return (
    <main className="mx-auto mt-8 w-full max-w-md p-4 sm:mt-16 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {initializationError && (
          <div>
            <p role="status">
              {initializationError}{" "}
              {canRetryInitialization
                ? "You can sign in below or try restoring your session again."
                : "Please sign in again."}
            </p>
            {canRetryInitialization && (
              <button type="button" onClick={() => void retryInitialization()}>
                Retry session restore
              </button>
            )}
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border px-3 py-2"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            
          />
          {errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded border px-3 py-2"
            {...register("password", { required: "Password is required" })}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && <p id="password-error" role="alert">{errors.password.message}</p>}
        </div>
        {submitError && <p role="alert">{submitError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
};

export default LoginPage;
