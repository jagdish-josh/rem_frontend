import api from '@/lib/api';
import type { Agent, CreateAgentDTO } from '../types';

export const agentsService = {
    getAgents: async (): Promise<Agent[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    createAgent: async (data: CreateAgentDTO): Promise<Agent> => {
        const response = await api.post('/users', data);
        return response.data;
    }
};
