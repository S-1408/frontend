const Header = () => {
  return (
    <header className="h-16 flex items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">JobTrackr
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Welcome back</span>
        <button
          type="button"
          aria-label="Open profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >S</button>
      </div>
    </header>
  )
}

export default Header