import { apiClient } from "../../../lib/apiClient/apiClient";
import { API_ENDPOINTS } from "../../../lib/apiClient/endpoints";
import type {
    Application,
    ApplicationFilters,
    ApplicationStats,
    CreateApplicationPayload,
} from "../types";

const authenticatedRequest = { _authRequired: true };

// Mark protected endpoints explicitly so public requests never refresh on 401 by accident.
export async function getApplications(
    filters: ApplicationFilters = {},
    signal?: AbortSignal,
) {
    const response = await apiClient.get<Application[]>(API_ENDPOINTS.applications.collection, {
        ...authenticatedRequest,
        params: {
            search: filters.search || undefined, // axios leaves out undefined params
            status: filters.status || undefined,
        },
        signal, // cancel outated search
    });
    return response.data;
}

export async function getApplicationStats(signal?: AbortSignal): Promise<ApplicationStats> {
    const response = await apiClient.get<ApplicationStats>(API_ENDPOINTS.dashboard.stats, {
        ...authenticatedRequest,
        signal,
    });
    return response.data;
}

export async function fetchApplication(id: string) {
    const response = await apiClient.get(
      API_ENDPOINTS.applications.byId(id),
      authenticatedRequest,
    );
    return response.data;
}

export async function deleteApplication(id: string) {
    const response = await apiClient.delete<Application>(
      API_ENDPOINTS.applications.byId(id),
      authenticatedRequest,
    );
    return response.data;
}

export async function createApplication(payload: CreateApplicationPayload) {
    const response = await apiClient.post<Application>(
      API_ENDPOINTS.applications.collection,
      payload,
      authenticatedRequest,
    );
    return response.data;
}

export async function updateApplication(
    id: string,
    payload: Partial<CreateApplicationPayload>,
) {
    const response = await apiClient.patch<Application>(
        API_ENDPOINTS.applications.byId(id),
        payload,
        authenticatedRequest,
    );
    return response.data;
}
