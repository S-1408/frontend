import type {
  Application,
  ApplicationStatusData,
} from "../../applications/types";

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
