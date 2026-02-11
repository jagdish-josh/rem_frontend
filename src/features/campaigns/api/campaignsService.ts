import api from '@/lib/api';
import type { EmailTemplate, EmailType, CreateEmailTemplateDTO } from '../types';

export const campaignsService = {
    getEmailTypes: async (): Promise<EmailType[]> => {
        const response = await api.get('/email_types');
        return response.data;
    },

    getTemplates: async (): Promise<EmailTemplate[]> => {
        const response = await api.get('/email_templates');
        return response.data;
    },

    createTemplate: async (data: CreateEmailTemplateDTO): Promise<{ message: string }> => {
        const response = await api.post('/email_templates', { email_template: data });
        return response.data;
    },

    getTemplate: async (id: string): Promise<EmailTemplate> => {
        const response = await api.get(`/email_templates/${id}`);
        return response.data;
    },

    createEmailType: async (data: { key: string; description?: string }): Promise<EmailType> => {
        const response = await api.post('/email_types', { email_type: data });
        return response.data;
    },

    createInstantCampaign: async (payload: { emails: string[], email_template_id: number }): Promise<{ message: string }> => {
        const response = await api.post('/create/campaign', payload);
        return response.data;
    }
};
