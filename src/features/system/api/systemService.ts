import api from '@/lib/api';
import type { Organization, CreateOrgDTO, CreateOrgAdminDTO, UpdateOrgDTO, UpdateOrgAdminDTO } from '../types';

export const systemService = {
    getOrganizations: async (): Promise<Organization[]> => {
        const response = await api.get('/organizations');
        if (!Array.isArray(response.data)) {
            // Check for wrapped response
            // @ts-ignore
            if (response.data?.organizations && Array.isArray(response.data.organizations)) {
                // @ts-ignore
                return response.data.organizations;
            }
            throw new Error("Unexpected response format: " + JSON.stringify(response.data));
        }
        return response.data;
    },

    createOrganization: async (data: CreateOrgDTO): Promise<Organization> => {
        const response = await api.post('/organizations', data);
        return response.data.organization; // Backend returns formatted object
    },

    updateOrganization: async (data: UpdateOrgDTO): Promise<Organization> => {
        const response = await api.patch(`/organizations/${data.id}`, { organization: data.organization });
        return response.data;
    },

    updateOrgAdmin: async (data: UpdateOrgAdminDTO): Promise<any> => {
        const response = await api.patch(`/admin/org_admins/${data.id}`, data);
        return response.data;
    },

    createOrgAdmin: async (data: CreateOrgAdminDTO): Promise<any> => {
        // Endpoint based on Admin::OrgAdminsController
        const response = await api.post('/admin/org_admins', data);
        return response.data;
    }
};
