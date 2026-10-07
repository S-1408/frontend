import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import * as Sentry from "@sentry/react";

// Imported first in main.tsx: Sentry must be initialised before the router
// is created so route-based tracing can hook into it.
// No DSN (local dev, tests) => Sentry stays off and captureException is a no-op.
const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      // Names transactions by route pattern (/applications) instead of raw URL
      Sentry.reactRouterBrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    // Sample 20% of page loads/navigations in production to save quota
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Attach trace headers to our own API so frontend and backend traces link up
    tracePropagationTargets: [import.meta.env.VITE_API_BASE_URL].filter(Boolean),
  });
}
