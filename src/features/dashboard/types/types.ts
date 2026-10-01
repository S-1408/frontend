export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";
export type ApplicationStatusData = {
  status: ApplicationStatus;
  count: number;
};
export type StatusOverviewProps = {
  data: ApplicationStatusData[];
};
export type StatCardProps = {
  title: string;
  value: number;
};
export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
};
export type ApplicationResponse = {
  data: Application[];
};
export type StatusBadgeProps = {
  status: ApplicationStatus;
};