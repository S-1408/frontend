import { useState } from "react"
import { Outlet, useNavigation } from "react-router-dom"
import Header from "../shared/components/Layout/Header"
import Sidebar from "../shared/components/Layout/Sidebar"

const AppLayout = () => {
  // "loading" while a lazy page's file downloads after a link click. The
  // current page stays visible, so this bar is the only sign something's happening
  const isNavigating = useNavigation().state === "loading"
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
            {isNavigating && (
              <div
                role="progressbar"
                aria-label="Loading page"
                className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-indigo-500"
              />
            )}
            <Header
              isMobileNavOpen={isMobileNavOpen}
              onToggleMobileNav={() => setIsMobileNavOpen((open) => !open)}
            />
            <div className="relative flex min-h-0 flex-1">
                <Sidebar
                  isMobileNavOpen={isMobileNavOpen}
                  onNavigate={() => setIsMobileNavOpen(false)}
                />
                {isMobileNavOpen && (
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/30 md:hidden"
                    onClick={() => setIsMobileNavOpen(false)}
                  />
                )}
                <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                    <Outlet/>
                </main>
            </div>
        </div>
  )
}

export default AppLayout

// App
//  │
//  └── AppLayout
//        ├── Sidebar
//        ├── Header
//        └── Outlet - Outlet is where the currently matched child route appears.
//              │
//              ├── Dashboard
//              ├── Applications
//              └── Settings