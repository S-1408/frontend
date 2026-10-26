import { useAuth } from "../../../features/auth/authContext";

const Header = () => {
  const { user } = useAuth();
  const displayName = user?.name
    || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
    || user?.email
    || "Account";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">JobTrackr</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm text-gray-900">Welcome back, {displayName}</p>
          {user?.email && <p className="text-xs text-gray-500">{user.email}</p>}
        </div>
        <button
          type="button"
          aria-label={`Open profile for ${displayName}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}

export default Header