export interface Agent {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    organization_id: number;
}

export interface CreateAgentDTO {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
}
