import { statusConfig } from "../../constants/status";
import type { ApplicationStatus } from "../../types";

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
