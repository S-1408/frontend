import { apiClient } from "../../../lib/apiClient/apiClient";
import type { Application } from "../types/types";

export async function getApplications(){
    const response = await apiClient.get<Application[]>("/applicationss");
    return response.data
}

export async function fetchApplication(id:string){
    const response = await apiClient.get(`/applications/${id}`)
    return response.data
}

export async function deleteApplication(id:string){
    const response = await apiClient.delete(`/application/${id}`)
    return response.data
}

export async function createAPplication(payload:{
    company:string;
    role:string;
    status?:string
}){
    const response = await apiClient.post('/applications',payload )
    return response.data
}