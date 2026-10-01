import type { StatusOverviewProps } from "../types/types";
import StatCard from "./StatCard";

const StatusOverview = ({ data }: StatusOverviewProps) => {
  return (
    <div>
      <h1 className="text-xl font-bold mt-2">Application Status</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <StatCard key={item.status} title={item.status} value={item.count} />
        ))}
      </div>
    </div>
  );
};

export default StatusOverview;
