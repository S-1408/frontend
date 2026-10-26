import RecentApplication from "../components/RecentApplication";
import StatusOverview from "../components/StatusOverview";
import SectionErrorBoundary from "../../../shared/components/ErrorBoundary/SectionErrorBoundary";

const Dashboard = () => {
  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your job applications.
        </p>
      </div>
      {/* Separate boundaries: one widget failing leaves the other visible */}
      <SectionErrorBoundary name="dashboard-status-overview" title="Couldn't display the status overview.">
        <StatusOverview />
      </SectionErrorBoundary>
      <SectionErrorBoundary name="dashboard-recent-applications" title="Couldn't display recent applications.">
        <RecentApplication />
      </SectionErrorBoundary>
    </div>
  );
};
export default Dashboard;
