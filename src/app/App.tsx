// App.tsx can be the application shell/layout,like AppLayout, not necessarily the Dashboard.
function App() {
  return <div></div>;
}

export default App;


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