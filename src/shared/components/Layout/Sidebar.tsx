import { NavLink } from "react-router-dom";
type SidebarProps = {
  isMobileNavOpen: boolean;
  onNavigate: () => void;
};

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
const Sidebar = ({ isMobileNavOpen, onNavigate }: SidebarProps) => {
  return (
    <aside
      id="primary-navigation"
      aria-label="Primary navigation"
      className={`${isMobileNavOpen ? "fixed inset-y-16 left-0 z-40 block h-[calc(100dvh-4rem)] w-72 max-w-[85vw] overflow-y-auto shadow-xl" : "hidden"} border-r bg-white md:static md:block md:h-auto md:min-h-0 md:w-64 md:max-w-none md:shrink-0 md:shadow-none`}
    >
      <div className="p-5 sm:p-6">
        <h1 className="text-xl font-bold">JobTrackr</h1>
      </div>

      <nav className="flex flex-col gap-1 px-4">
        {naviagtion.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
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
