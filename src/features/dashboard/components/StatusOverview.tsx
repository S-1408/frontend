import { useApplicationStats } from "../../applications/hooks/useApplicationStats";
import type { ApplicationStatus } from "../../applications/types";
import StatCard from "./StatCard";

const statuses: ApplicationStatus[] = ["applied", "interview", "offer", "rejected"];

const StatusOverview = () => {
  const { data: stats, isPending, isError } = useApplicationStats();

  if (isPending) {
    return <p className="mt-6 text-sm text-gray-500" role="status">Loading application stats...</p>;
  }

  if (isError) {
    return <p className="mt-6 text-sm text-red-600" role="alert">Couldn't load application stats.</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mt-2">Application Status</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        {statuses.map((status) => (
          <StatCard key={status} title={status} value={stats.byStatus[status]} />
        ))}
      </div>
    </div>
  );
};

export default StatusOverview;
