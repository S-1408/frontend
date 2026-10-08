import { apiClient } from "../../../lib/apiClient/apiClient";
import type {
    Application,
    ApplicationFilters,
    CreateApplicationPayload,
} from "../types";

export async function getApplications(
    filters: ApplicationFilters = {},
    signal?: AbortSignal,
) {
    const response = await apiClient.get<Application[]>("/applications", {
        params: {
            search: filters.search || undefined, // axios leaves out undefined params
            status: filters.status || undefined,
        },
        signal, // cancel outated search
    });
    return response.data;
}

export async function fetchApplication(id: string) {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
}

export async function deleteApplication(id: string) {
    const response = await apiClient.delete<Application>(`/applications/${id}`);
    return response.data;
}

export async function createApplication(payload: CreateApplicationPayload) {
    const response = await apiClient.post<Application>("/applications", payload);
    return response.data;
}

export async function updateApplication(
    id: string,
    payload: Partial<CreateApplicationPayload>,
) {
    const response = await apiClient.patch<Application>(
        `/applications/${id}`,
        payload,
    );
    return response.data;
}
