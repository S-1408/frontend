// Must stay the first import: Sentry has to init before the router is created
import './lib/monitoring/sentry.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'
import AppCrashFallback from './shared/components/ErrorBoundary/AppCrashFallback.tsx'
import { reportError } from './lib/monitoring/reportError.ts'
import { createQueryClient } from './lib/queryClient/queryClient.ts'

const queryClient = createQueryClient()
// React 19 hooks: every error caught by ANY boundary (ours or React Router's)
// and every uncaught one is reported here, so boundaries don't log themselves
createRoot(document.getElementById('root')!, {
  onCaughtError: reportError,
  onUncaughtError: reportError,
}).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={AppCrashFallback}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* One app-wide toast outlet; call toast.success/error from anywhere */}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)


// main.tsx
//    ↓
// Providers
//    ├── QueryClientProvider
//    └── RouterProvider
//           ↓
//         App
//           ↓
//       AppLayout
//        ┌───┴────┐
//    Sidebar     Outlet
//                  ↓
//           ┌──────┼────────┐
//           ↓      ↓        ↓
//       Dashboard Applications Settings