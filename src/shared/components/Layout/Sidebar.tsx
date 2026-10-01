import { NavLink } from "react-router-dom";
const naviagtion = [
  {
    label: "Dashboard",
    to: "/",
  },
  {
    label: "Applications",
    to: "/applications",
  },
  {
    label: "Interviews",
    to: "/interview",
  },
  {
    label: "Settings",
    to: "/settings",
  },
];
const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 min-h-screen border-r bg-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">JobTrackr</h1>
      </div>

      <nav className="flex flex-col gap-1 px-4">
        {naviagtion.map((item) => (
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 font-medium  transition" ${isActive ? " bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} `
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
