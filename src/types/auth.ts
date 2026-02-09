export interface User {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    role: 'ORG_ADMIN' | 'ORG_USER' | 'SYSTEM_ADMIN';
    orgId: string;
    organizationName?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
