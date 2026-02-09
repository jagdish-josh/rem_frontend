import api from '@/lib/api';
import type { LoginCredentials, User, AuthResponse } from '@/types/auth';

export const authService = {
    login: async (credentials: LoginCredentials, isSystemAdmin: boolean = false): Promise<AuthResponse> => {
        const endpoint = isSystemAdmin ? '/auth/super/login' : '/auth/login';
        const response = await api.post(endpoint, credentials);

        const data = response.data;
        console.log('Login response:', data); // Debug logging

        // Normalize response
        if (isSystemAdmin) {
            // Super User response structure handling
            // Backend returns { token, super_user: { id, email } }
            return {
                token: data.token,
                user: {
                    id: data.super_user.id.toString(),
                    email: data.super_user.email,
                    name: 'System Admin',
                    role: 'SYSTEM_ADMIN',
                    orgId: 'system',
                }
            };
        } else {
            // Normal User response structure
            // Backend returns { token, user: { id, full_name, email, role, organization_id, organization_name } }
            return {
                token: data.token,
                user: {
                    id: data.user.id.toString(),
                    name: data.user.full_name,
                    fullName: data.user.full_name,
                    email: data.user.email,
                    role: data.user.role,
                    orgId: data.user.organization_id.toString(),
                    organizationName: data.user.organization_name
                }
            };
        }
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        // Optional: Call backend logout if it exists
    },

    getUser: async (): Promise<User | null> => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user_data');
        if (!token || !savedUser) return null;
        return JSON.parse(savedUser);
    }
};
