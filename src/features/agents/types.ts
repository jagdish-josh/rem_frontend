export interface Agent {
    id: string;
    name: string;           // Backend returns this in index
    full_name: string;      // Backend returns this in create/update
    email: string;
    phone?: string;
    role_name: string;      // Backend returns role_name (e.g., "ORG_USER", "ORG_ADMIN")
    organization_name: string;
    organization_id: number;
}

export interface CreateAgentDTO {
    full_name: string;
    email: string;
    phone?: string;
}

export interface UpdateAgentDTO {
    id: string;
    user: {
        full_name: string;
        phone?: string;
    }
}
