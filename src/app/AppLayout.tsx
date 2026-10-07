import { Outlet, useNavigation } from "react-router-dom"
import Header from "../shared/components/Layout/Header"
import Sidebar from "../shared/components/Layout/Sidebar"

const AppLayout = () => {
  // "loading" while a lazy page's file downloads after a link click. The
  // current page stays visible, so this bar is the only sign something's happening
  const isNavigating = useNavigation().state === "loading"

  return (
    <div className="h-screen overflow-hidden flex flex-col">
            {isNavigating && (
              <div
                role="progressbar"
                aria-label="Loading page"
                className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-indigo-500"
              />
            )}
            <Header/>
            {/* // min-h-0 You're allowed to shrink vertically." */}
            <div className="flex min-h-0 flex-1">
                <Sidebar/>
                {/* //min-w-0 - "Content area can shrink horizontally." flex-1 Take all the remaining available space." */}
                <main className="min-w-0 flex-1 overflow-y-auto"> 
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