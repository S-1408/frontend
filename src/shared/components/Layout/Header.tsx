import { Menu, X } from "lucide-react";
import { useAuth } from "../../../features/auth/authContext";

type HeaderProps = {
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
};

const Header = ({ isMobileNavOpen, onToggleMobileNav }: HeaderProps) => {
  const { user } = useAuth();
  const displayName = user?.name
    || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
    || user?.email
    || "Account";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b bg-white px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileNavOpen}
          aria-controls="primary-navigation"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600 md:hidden"
          onClick={onToggleMobileNav}
        >
          {isMobileNavOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
        <h1 className="truncate text-lg font-semibold text-gray-900">JobTrackr</h1>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="max-w-48 truncate text-sm text-gray-900">Welcome back, {displayName}</p>
          {user?.email && <p className="max-w-48 truncate text-xs text-gray-500">{user.email}</p>}
        </div>
        <button
          type="button"
          aria-label={`Open profile for ${displayName}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}

export default Header