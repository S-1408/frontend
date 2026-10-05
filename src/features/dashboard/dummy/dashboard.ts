import type {
  Application,
  ApplicationStatus,
  ApplicationStatusData,
} from "../../applications/types/types";

export const applicationStatus:ApplicationStatusData[] = [
  {
    status: "applied",
    count: 24,
  },
  {
    status: "interview",
    count: 8,
  },
  {
    status: "offer",
    count: 2,
  },
  {
    status: "rejected",
    count: 14,
  },
];
export const recentApplication:Application[]=[
    {
        id:"1",
        company:"Google",
        role:"Frontend Dev",
        status:"interview",
        appliedAt:"Aug 30 2026"
    },
     {
        id:"2",
        company:"Microsoft",
        role:"React Developer",
        status:"applied",
        appliedAt:"Aug 28 2026"
    },
     {
        id:"3",
        company:"Amazon",
        role:"SDE II",
        status:"rejected",
        appliedAt:"Aug 25 2026"
    }
]

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
}