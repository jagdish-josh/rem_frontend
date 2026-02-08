export interface Organization {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateOrgDTO {
    organization: {
        name: string;
        description?: string;
    };
    user: {
        full_name: string;
        email: string;
        phone?: string;
    };
}

export interface UpdateOrgDTO {
    id: number;
    organization: {
        name: string;
        description?: string;
    }
}


export interface CreateOrgAdminDTO {
    user: {
        organization_id: number;
        full_name: string;
        email: string;
        password: string;
        phone?: string;
    }
}

export interface UpdateOrgAdminDTO {
    id: number;
    user: {
        full_name?: string;
        phone?: string;
    }
}

export interface OrgAdmin {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    status?: string;
    role?: string;
    organization_id?: number;
}
