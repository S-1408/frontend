// Shown inside the layout while a lazy page's code downloads on first load.
// Header and sidebar are already visible, so this only fills the content area.
const PageLoader = () => {
  return (
    <div role="status" aria-label="Loading page" className="animate-pulse space-y-4 p-6">
      <div className="h-7 w-48 rounded-lg bg-gray-200" />
      <div className="h-4 w-72 rounded bg-gray-100" />
      <div className="h-64 rounded-2xl bg-gray-100" />
    </div>
  );
};

export default PageLoader;
