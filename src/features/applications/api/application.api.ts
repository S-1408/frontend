import { apiClient } from "../../../lib/apiClient/apiClient";
import type { Application, CreateApplicationPayload } from "../types/types";

export async function getApplications(){
    const response = await apiClient.get<Application[]>("/applications");
    return response.data
}

export async function fetchApplication(id:string){
    const response = await apiClient.get(`/applications/${id}`)
    return response.data
}

export async function deleteApplication(id:string){
    const response = await apiClient.delete(`/applications/${id}`)
    return response.data
}

export async function createApplication(payload:CreateApplicationPayload){
    const response = await apiClient.post<Application>('/applications',payload)
    return response.data
}