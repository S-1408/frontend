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
