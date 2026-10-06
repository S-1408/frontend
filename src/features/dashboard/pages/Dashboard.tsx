import RecentApplication from "../components/RecentApplication";
import StatusOverview from "../components/StatusOverview";
import { applicationStatus,  } from "../dummy/dashboard";
import SectionBoundary from "../../../shared/components/ErrorBoundary/SectionBoundary";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your job applications.
        </p>
      </div>
      {/* Separate boundaries: one widget failing leaves the other visible */}
      <SectionBoundary name="dashboard-status-overview" title="Couldn't display the status overview.">
        <StatusOverview data={applicationStatus} />
      </SectionBoundary>
      <SectionBoundary name="dashboard-recent-applications" title="Couldn't display recent applications.">
        <RecentApplication />
      </SectionBoundary>
    </div>
  );
};
export default Dashboard;
