import type { ApplicationStatus } from "../types";

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

// Record<ApplicationStatus, ...> makes a missing or misspelled status a compile error
export const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  },
  interview: {
    label: "Interviewing",
    className: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20 ",
  },
  offer: {
    label: "Offer",
    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  },
};
