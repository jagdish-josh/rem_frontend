import api from '@/lib/api';
import type { Agent, CreateAgentDTO, UpdateAgentDTO } from '../types';

export const agentsService = {
    getAgents: async (): Promise<Agent[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    createAgent: async (data: CreateAgentDTO): Promise<Agent> => {
        const response = await api.post('/users', data);
        return response.data;
    },

    updateAgent: async (data: UpdateAgentDTO): Promise<Agent> => {
        const response = await api.patch(`/users/${data.id}`, data.user);
        return response.data;
    },

    deleteAgent: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};
