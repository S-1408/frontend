import { createBrowserRouter, type RouteObject } from "react-router-dom";
import * as Sentry from "@sentry/react";

import AppLayout from "./AppLayout";
import RouterErrorPage from "../shared/components/ErrorBoundary/RouterErrorPage";
import NotFoundPage from "../shared/components/ErrorBoundary/NotFoundPage";
import PageLoader from "../shared/components/Loading/PageLoader";
// Eager on purpose: it's the landing page. Lazy-loading it would make every
// first visit wait for main.js, THEN request Dashboard.js (an extra round trip)
// to save ~1 kB.
import Dashboard from "../features/dashboard/pages/Dashboard";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";

// Secondary pages are code-split: each becomes its own JS file, downloaded
// only when its route is visited. The router's `lazy` (not React.lazy) loads the file
// BEFORE switching pages, so the old page stays visible meanwhile instead of
// flashing a spinner, and a failed download goes to errorElement.
// Layout, error and 404 pages stay in the main bundle: they're small and
// must work even when a page file fails to load.

// React Router decides what appears based on the URL.
// Exported separately so tests can mount the real route tree in a memory router
export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouterErrorPage />,
  },
  {
    path: "/",
    // Guard the entire app area so each child route shares the same session check.
    element: <ProtectedRoute />,
    errorElement: <RouterErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            // A page crash renders inside AppLayout so the header and sidebar remain available.
            errorElement: <RouterErrorPage />,
            HydrateFallback: PageLoader,
            children: [
              { index: true, element: <Dashboard /> },
              {
                path: "applications",
                lazy: async () => ({
                  Component: (await import("../features/applications/pages/ApplicationPage")).default,
                }),
              },
              {
                path: "*",
                element: <NotFoundPage />,
              },
            ],
          },
        ],
      },
    ],
  },
];

// Wrapped so Sentry names performance transactions by route pattern
export const router = Sentry.wrapCreateBrowserRouter(createBrowserRouter)(routes)


// /login -> LoginPage
// /      -> ProtectedRoute -> AppLayout -> Dashboard / Applications / 404