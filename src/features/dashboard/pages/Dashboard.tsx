import RecentApplication from "../components/RecentApplication";
import StatusOverview from "../components/StatusOverview";
import { applicationStatus,  } from "../dummy/dashboard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your job applications.
        </p>
      </div>
      <StatusOverview data={applicationStatus} />
      <RecentApplication />
    </div>
  );
};
export default Dashboard;
