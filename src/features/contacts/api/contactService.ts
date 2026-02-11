import api from '@/lib/api';
import type { Contact, CreateContactDTO, PaginatedContactsResponse, CSVImportResponse, PreferenceReferenceData } from '../types';

export const contactService = {
    /**
     * Fetch preference reference data
     */
    getPreferences: async (): Promise<PreferenceReferenceData> => {
        const response = await api.get('/preferences');
        return response.data;
    },

    /**
     * Fetch all contacts for the current organization
     */
    getContacts: async (): Promise<Contact[]> => {
        const response = await api.get('/contacts');
        return response.data;
    },

    /**
     * Fetch paginated contacts
     */
    getPaginatedContacts: async (page: number = 1, perPage: number = 25, filters?: any): Promise<PaginatedContactsResponse> => {
        const response = await api.get('/contacts', {
            params: {
                page,
                per_page: perPage,
                ...filters
            }
        });
        return response.data;
    },

    /**
     * Create a new contact
     */
    createContact: async (data: CreateContactDTO): Promise<Contact> => {
        const response = await api.post('/contacts', data);
        return response.data;
    },

    /**
     * Import contacts from CSV file
     */
    importCSV: async (file: File): Promise<CSVImportResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/contacts/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
