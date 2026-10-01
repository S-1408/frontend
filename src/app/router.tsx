import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Application from "../features/applications/pages/Application";
// React Router decides what appears based on the URL.
export const router = createBrowserRouter([
    {
        path:'/',
        element:<AppLayout/>,
        children:[
           {
            index:true,
            element:<Dashboard/>
           },
             {
            path:'/applications',
            element:<Application/>
           },
         ]
    }
])


// /
// └── AppLayout
//       ├── Header
//       ├── Sidebar
//       └── Outlet
//             ↓
//          Dashboard