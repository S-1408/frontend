import { createBrowserRouter, type RouteObject } from "react-router-dom";
import * as Sentry from "@sentry/react";
import AppLayout from "./AppLayout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Application from "../features/applications/pages/Application";
import RouterErrorPage from "../shared/components/ErrorBoundary/RouterErrorPage";
import NotFoundPage from "../shared/components/ErrorBoundary/NotFoundPage";
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
            children:[
              {
                index:true,
                element:<Dashboard/>
              },
              {
                path:'applications',
                element:<Application/>
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