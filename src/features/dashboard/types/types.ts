import type { ApplicationStatusData } from "../../applications/types/types";

export type StatusOverviewProps = {
  data: ApplicationStatusData[];
};
export type StatCardProps = {
  title: string;
  value: number;
};
