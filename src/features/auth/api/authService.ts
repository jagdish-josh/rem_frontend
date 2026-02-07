import api from '@/lib/api';
import type { LoginCredentials, User, AuthResponse } from '@/types/auth';

export const authService = {
    login: async (credentials: LoginCredentials, isSystemAdmin: boolean = false): Promise<AuthResponse> => {
        const endpoint = isSystemAdmin ? '/auth/super/login' : '/auth/login';
        const response = await api.post(endpoint, credentials);

        const data = response.data;

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
            // Backend returns { token, user: { id, full_name, email, role, organization_id } }
            return {
                token: data.token,
                user: {
                    ...data.user,
                    // Backend returns 'Office Admin' or 'User'. Map to frontend types if needed.
                    // Assuming backend sends role name directly, otherwise map it.
                    // Frontend helper:
                    role: data.user.role === 'Office Admin' ? 'ORG_ADMIN' : 'ORG_USER',
                    orgId: data.user.organization_id.toString()
                }
            };
        }
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('token');
        // Optional: Call backend logout if it exists
    },

    getUser: async (): Promise<User | null> => {
        const savedUser = localStorage.getItem('user_data');
        return savedUser ? JSON.parse(savedUser) : null;
    }
};
