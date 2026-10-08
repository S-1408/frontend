// Domain types for the applications feature: entities, payloads, unions.
// Component props live next to their components, not here.

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";
export type ApplicationStatusData = {
  status: ApplicationStatus;
  count: number;
};

export type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
};

export type CreateApplicationPayload = Omit<Application, "id">;

// What the form edits: everything except the server-owned id
export type ApplicationFormValues = CreateApplicationPayload;

export type ApplicationFilters = {search?:string;status?:ApplicationStatus}
