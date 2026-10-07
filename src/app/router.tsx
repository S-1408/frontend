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
        path:'/',
        element:<AppLayout/>,
        errorElement:<RouterErrorPage/>,//catches 404s and layout crashes
        children:[
          {
            // Pathless route: a crashing page renders its error inside
            // AppLayout's <Outlet>, so the header and sidebar keep working
            errorElement:<RouterErrorPage/>,
            // First visit only: shown in the layout's <Outlet> while a lazy
            // page's file downloads (e.g. opening /applications directly). Without it the whole app is blank.
            HydrateFallback:PageLoader,
            children:[
              {
                index:true,
                element:<Dashboard/>
              },
              {
                path:'applications',
                lazy:async()=>({
                  Component:(await import("../features/applications/pages/Application")).default
                })
              },
              {
                // Unknown URLs show 404 inside the layout instead of a blank page
                path:'*',
                element:<NotFoundPage/>
              },
            ]
          },
        ]
    }
]

// Wrapped so Sentry names performance transactions by route pattern
export const router = Sentry.wrapCreateBrowserRouter(createBrowserRouter)(routes)


// /
// └── AppLayout
//       ├── Header
//       ├── Sidebar
//       └── Outlet
//             ↓
//          Dashboard