import type { ApplicationStatus } from "../types/types";

// Single list of statuses for every dropdown, so option values can't drift
// from the ApplicationStatus type
export const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus;
  label: string;
}[] = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];
