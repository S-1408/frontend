import { Outlet } from "react-router-dom"
import Header from "../shared/components/Layout/Header"
import Sidebar from "../shared/components/Layout/Sidebar"

const AppLayout = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
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