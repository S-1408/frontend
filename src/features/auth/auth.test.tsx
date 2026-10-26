import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { useAuth } from "./authContext";
import { server } from "../../test/server";
import { renderWithProviders } from "../../test/utils";
import { routes } from "../../app/router";
import LoginPage from "./pages/LoginPage";
import { clearAccessToken, getAccessToken, setAccessToken } from "./authTokens";
import { apiClient } from "../../lib/apiClient/apiClient";
import { getApplications } from "../applications/api/application.api";
import { getCurrentUser } from "./auth.api";
import Header from "../../shared/components/Layout/Header";

function AuthActions() {
  const { login, logout } = useAuth();
  return (
    <>
      <button type="button" onClick={() => void logout()}>Log out</button>
      <button type="button" onClick={() => void login("other@example.com", "password")}>
        Log in as another user
      </button>
    </>
  );
}

beforeEach(() => {
  clearAccessToken();
});

afterEach(() => {
  clearAccessToken();
});

describe("protected routes", () => {
  it("keeps the requested destination when an authenticated user reaches the login page", async () => {
    setAccessToken("signed-in-access");
    const router = createMemoryRouter([
      { path: "/login", element: <LoginPage /> },
      { path: "/applications", element: <h1>Applications destination</h1> },
    ], {
      initialEntries: [
        { pathname: "/login", state: { from: { pathname: "/applications" } } },
      ],
    });
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Applications destination" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login and returns them to the requested page", async () => {
    server.use(
      http.post("*/auth/login", () =>
        HttpResponse.json({ accessToken: "signed-in-access" }),
      ),
      http.get("*/applications", () => HttpResponse.json([])),
    );
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    const { user } = renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: /Applications/ })).toBeInTheDocument();
    expect(getAccessToken()).toBe("signed-in-access");
  });

  it("shows the backend error when login fails", async () => {
    server.use(
      http.post("*/auth/login", () => HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })),
    );
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });
    const { user } = renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
    expect(getAccessToken()).toBeNull();
  });

  it("restores a session in a new tab through the refresh cookie before loading a protected route", async () => {
    const observedRequests: {
      refreshCredentials?: RequestCredentials;
      protectedAuthorization: string | null;
      refreshCalls: number;
    } = { protectedAuthorization: null, refreshCalls: 0 };
    server.use(
      http.post("*/auth/refresh", ({ request }) => {
        observedRequests.refreshCalls += 1;
        observedRequests.refreshCredentials = request.credentials;
        return HttpResponse.json({ accessToken: "restored-access" });
      }),
      http.get("*/applications", ({ request }) => {
        observedRequests.protectedAuthorization = request.headers.get("Authorization");
        return HttpResponse.json([]);
      }),
    );
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    renderWithProviders(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );

    expect(await screen.findByRole("heading", { name: /Applications/ })).toBeInTheDocument();
    expect(getAccessToken()).toBe("restored-access");
    expect(observedRequests.refreshCredentials).toBe("include");
    expect(observedRequests.refreshCalls).toBe(1);
    await waitFor(() => {
      expect(observedRequests.protectedAuthorization?.endsWith("restored-access")).toBe(true);
    });
  });

  it("clears auth and shows login when refresh fails during initialization", async () => {
    let refreshCalls = 0;
    server.use(
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ message: "Refresh token expired" }, { status: 401 });
      }),
    );
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/refresh token expired/i);
    expect(screen.queryByRole("button", { name: "Retry session restore" })).not.toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
    expect(refreshCalls).toBe(1);
  });

  it("preserves a retry path after a temporary refresh server error", async () => {
    let refreshCalls = 0;
    server.use(
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        if (refreshCalls === 1) {
          return HttpResponse.json({ message: "Auth service unavailable" }, { status: 503 });
        }
        return HttpResponse.json({ accessToken: "restored-after-retry" });
      }),
      http.get("*/applications", () => HttpResponse.json([])),
    );
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    const { user } = renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Auth service unavailable/i);
    expect(getAccessToken()).toBeNull();

    await user.click(screen.getByRole("button", { name: "Retry session restore" }));

    expect(await screen.findByRole("heading", { name: /Applications/ })).toBeInTheDocument();
    expect(refreshCalls).toBe(2);
    expect(getAccessToken()).toBe("restored-after-retry");
  });

  it("shows a recoverable error when refresh fails because of a network issue", async () => {
    server.use(http.post("*/auth/refresh", () => HttpResponse.error()));
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Unable to reach the server/i);
    expect(screen.getByRole("button", { name: "Retry session restore" })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
  });

  it("rejects a successful refresh response that does not contain a valid access token", async () => {
    let refreshCalls = 0;
    server.use(
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "" });
      }),
    );
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    renderWithProviders(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/invalid response/i);
    expect(getAccessToken()).toBeNull();
    expect(refreshCalls).toBe(1);
  });
});

describe("current user API", () => {
  it("calls the protected /auth/me endpoint with the access token", async () => {
    let authorization: string | null = null;
    server.use(
      http.get("*/auth/me", ({ request }) => {
        authorization = request.headers.get("Authorization");
        return HttpResponse.json({ id: "user-1" });
      }),
    );
    setAccessToken("current-user-access");

    await expect(getCurrentUser()).resolves.toEqual({ id: "user-1" });
    expect(authorization).toBe("Bearer current-user-access");
  });

  it("loads the current user during session restoration and displays details in the header", async () => {
    let meCalls = 0;
    server.use(
      http.post("*/auth/refresh", () => HttpResponse.json({ accessToken: "restored-access" })),
      http.get("*/auth/me", ({ request }) => {
        meCalls += 1;
        expect(request.headers.get("Authorization")).toBe("Bearer restored-access");
        return HttpResponse.json({
          user: { id: "user-1", firstName: "Jordan", lastName: "Lee", email: "jordan@example.com" },
        });
      }),
    );

    renderWithProviders(<Header isMobileNavOpen={false} onToggleMobileNav={() => undefined} />);

    expect(await screen.findByText(/Welcome back, Jordan Lee/)).toBeInTheDocument();
    expect(screen.getByText("jordan@example.com")).toBeInTheDocument();
    expect(meCalls).toBe(1);
  });
});

describe("concurrent API token refresh", () => {
  it("shares one refresh across concurrent 401 responses and retries every failed request", async () => {
    let refreshCalls = 0;
    let expiredRequests = 0;
    let retriedRequests = 0;
    server.use(
      http.get("*/applications", ({ request }) => {
        if (request.headers.get("Authorization") === "Bearer expired-access") {
          expiredRequests += 1;
          return HttpResponse.json({}, { status: 401 });
        }
        retriedRequests += 1;
        return HttpResponse.json([]);
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("expired-access");

    await expect(Promise.all(Array.from({ length: 5 }, () => getApplications()))).resolves.toHaveLength(5);

    expect(refreshCalls).toBe(1);
    expect(expiredRequests).toBe(5);
    expect(retriedRequests).toBe(5);
    expect(getAccessToken()).toBe("fresh-access");
  });

  it("retries a late 401 with the token another request already refreshed", async () => {
    let releaseDelayed401!: () => void;
    let announceDelayedRequest!: () => void;
    const delayed401 = new Promise<void>((resolve) => {
      releaseDelayed401 = resolve;
    });
    const delayedRequestStarted = new Promise<void>((resolve) => {
      announceDelayedRequest = resolve;
    });
    let refreshCalls = 0;
    let delayedRequestCalls = 0;
    server.use(
      http.get("*/delayed", async ({ request }) => {
        delayedRequestCalls += 1;
        if (request.headers.get("Authorization") === "Bearer expired-access") {
          announceDelayedRequest();
          await delayed401;
          return HttpResponse.json({}, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
      http.get("*/trigger-refresh", ({ request }) => {
        if (request.headers.get("Authorization") === "Bearer expired-access") {
          return HttpResponse.json({}, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("expired-access");

    const delayedRequest = apiClient.get("/delayed", { _authRequired: true });
    await delayedRequestStarted;
    await expect(apiClient.get("/trigger-refresh", { _authRequired: true })).resolves.toMatchObject({ data: { ok: true } });
    releaseDelayed401();

    await expect(delayedRequest).resolves.toMatchObject({ data: { ok: true } });
    expect(delayedRequestCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it("does not refresh successful calls when another protected call returns 401", async () => {
    let successfulCalls = 0;
    let unauthorizedCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get("*/successful", () => {
        successfulCalls += 1;
        return HttpResponse.json({ ok: true });
      }),
      http.get("*/unauthorized", ({ request }) => {
        unauthorizedCalls += 1;
        if (request.headers.get("Authorization") === "Bearer expired-access") {
          return HttpResponse.json({}, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("expired-access");

    const [successful, unauthorized] = await Promise.all([
      apiClient.get("/successful", { _authRequired: true }),
      apiClient.get("/unauthorized", { _authRequired: true }),
    ]);

    expect(successful.data).toEqual({ ok: true });
    expect(unauthorized.data).toEqual({ ok: true });
    expect(successfulCalls).toBe(1);
    expect(unauthorizedCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it("does not refresh on 403 Forbidden", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/forbidden", () => HttpResponse.json({}, { status: 403 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("valid-access");

    await expect(apiClient.get("/forbidden", { _authRequired: true })).rejects.toMatchObject({
      response: { status: 403 },
    });
    expect(refreshCalls).toBe(0);
    expect(getAccessToken()).toBe("valid-access");
  });

  it("does not attach auth or refresh for a public API 401", async () => {
    let refreshCalls = 0;
    let receivedAuthorization: string | null = null;
    server.use(
      http.get("*/public", ({ request }) => {
        receivedAuthorization = request.headers.get("Authorization");
        return HttpResponse.json({}, { status: 401 });
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("existing-access");

    await expect(apiClient.get("/public")).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(receivedAuthorization).toBeNull();
    expect(refreshCalls).toBe(0);
    expect(getAccessToken()).toBe("existing-access");
  });

  it("does not refresh for non-expiration 401 codes and clears revoked sessions", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/revoked", () =>
        HttpResponse.json({ code: "SESSION_REVOKED" }, { status: 401 }),
      ),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("revoked-access");

    await expect(apiClient.get("/revoked", { _authRequired: true })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshCalls).toBe(0);
    expect(getAccessToken()).toBeNull();
  });

  it("does not refresh cancelled authenticated requests", async () => {
    let refreshCalls = 0;
    const controller = new AbortController();
    controller.abort();
    server.use(
      http.get("*/cancelled", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("existing-access");

    await expect(apiClient.get("/cancelled", {
      _authRequired: true,
      signal: controller.signal,
    })).rejects.toMatchObject({ code: "ERR_CANCELED" });

    expect(refreshCalls).toBe(0);
    expect(getAccessToken()).toBe("existing-access");
  });

  it("attempts cookie restoration when a protected request receives 401 without an access token", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", ({ request }) => {
        if (request.headers.get("Authorization") !== "Bearer restored-access") {
          return HttpResponse.json({}, { status: 401 });
        }
        return HttpResponse.json([]);
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "restored-access" });
      }),
    );

    await expect(getApplications()).resolves.toEqual([]);
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe("restored-access");
  });

  it("does not retry a request more than once and clears auth after retry returns 401", async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get("*/always-unauthorized", () => {
        protectedCalls += 1;
        return HttpResponse.json({}, { status: 401 });
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "fresh-access" });
      }),
    );
    setAccessToken("expired-access");

    await expect(apiClient.get("/always-unauthorized", { _authRequired: true })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(protectedCalls).toBe(2);
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
  });

  it("does not allow a pending refresh to restore auth after logout", async () => {
    let finishRefresh!: () => void;
    let refreshStarted!: () => void;
    const refreshGate = new Promise<void>((resolve) => {
      finishRefresh = resolve;
    });
    const started = new Promise<void>((resolve) => {
      refreshStarted = resolve;
    });
    let logoutCalls = 0;
    server.use(
      http.get("*/applications", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", async () => {
        refreshStarted();
        await refreshGate;
        return HttpResponse.json({ accessToken: "late-access" });
      }),
      http.post("*/auth/logout", () => {
        logoutCalls += 1;
        return HttpResponse.json({ success: true });
      }),
    );
    setAccessToken("expired-access");
    const { user, queryClient } = renderWithProviders(<AuthActions />);
    queryClient.setQueryData(["account", "private"], ["private data"]);

    const pendingProtectedRequest = getApplications();
    await started;
    await user.click(screen.getByRole("button", { name: "Log out" }));
    finishRefresh();

    await expect(pendingProtectedRequest).rejects.toThrow();
    expect(logoutCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(["account", "private"])).toBeUndefined();
  });

  it("clears cached user data before logging in as another account", async () => {
    server.use(
      http.post("*/auth/login", () => HttpResponse.json({ accessToken: "other-account-access" })),
    );
    setAccessToken("previous-account-access");
    const { user, queryClient } = renderWithProviders(<AuthActions />);
    queryClient.setQueryData(["account", "private"], ["previous account data"]);

    await user.click(screen.getByRole("button", { name: "Log in as another user" }));

    await waitFor(() => expect(getAccessToken()).toBe("other-account-access"));
    expect(queryClient.getQueryData(["account", "private"])).toBeUndefined();
  });

  it("rejects all waiting requests and clears auth when their shared refresh fails", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({}, { status: 401 });
      }),
    );
    setAccessToken("expired-access");

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () => getApplications()),
    );

    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
  });

  it("does not refresh again when a delayed 401 arrives after refresh revoked the session", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/fast-expired", () => HttpResponse.json({}, { status: 401 })),
      http.get("*/slow-expired", async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({}, { status: 401 });
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json(
          { code: "REFRESH_TOKEN_REVOKED", message: "Refresh token has been revoked" },
          { status: 401 },
        );
      }),
    );
    setAccessToken("expired-access");

    const results = await Promise.allSettled([
      apiClient.get("/fast-expired", { _authRequired: true }),
      apiClient.get("/slow-expired", { _authRequired: true }),
    ]);

    expect(results.every((result) => result.status === "rejected")).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
  });

  it("clears auth and cached user data when refresh token is revoked, then redirects to login", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json(
          { code: "REFRESH_TOKEN_REVOKED", message: "Refresh token has been revoked" },
          { status: 403 },
        );
      }),
    );
    setAccessToken("expired-access");
    const router = createMemoryRouter(routes, { initialEntries: ["/applications"] });
    const { queryClient } = renderWithProviders(<RouterProvider router={router} />);
    queryClient.setQueryData(["account", "private"], ["private user data"]);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/session has expired or was revoked/i);
    await waitFor(() => expect(getAccessToken()).toBeNull());
    expect(queryClient.getQueryData(["account", "private"])).toBeUndefined();
    expect(refreshCalls).toBe(1);
  });

  it("preserves the access token after a temporary refresh server failure", async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", () => {
        protectedCalls += 1;
        return HttpResponse.json({}, { status: 401 });
      }),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ message: "Temporarily unavailable" }, { status: 503 });
      }),
    );
    setAccessToken("expired-access");

    await expect(getApplications()).rejects.toMatchObject({
      response: { status: 503 },
    });

    expect(protectedCalls).toBe(1);
    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe("expired-access");
  });

  it("preserves the access token after a network failure during refresh", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.error();
      }),
    );
    setAccessToken("expired-access");

    await expect(getApplications()).rejects.toMatchObject({ code: "ERR_NETWORK" });

    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBe("expired-access");
  });

  it("clears the access token when refresh succeeds with an invalid token response", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "" });
      }),
    );
    setAccessToken("expired-access");

    await expect(getApplications()).rejects.toThrow(/valid access token/i);

    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
  });

  it("does not retry a 401 from the refresh endpoint", async () => {
    let refreshCalls = 0;
    server.use(
      http.get("*/applications", () => HttpResponse.json({}, { status: 401 })),
      http.post("*/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({}, { status: 401 });
      }),
    );
    setAccessToken("expired-access");

    await expect(getApplications()).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(refreshCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
  });
});
