export interface Contact {
    id: number;
    organization_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export interface ContactPreference {
    bhk_type?: string;
    furnishing_type?: string;
    location?: string;
    property_type?: string;
    power_backup_type?: string;
}

export interface CreateContactDTO {
    contact: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
    preference?: ContactPreference;
}

export interface PaginationInfo {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
}

export interface PaginatedContactsResponse {
    contacts: Contact[];
    pagination: PaginationInfo;
}

export interface CSVImportResponse {
    message: string;
}

export interface CSVImportErrorResponse {
    error: string;
    message: string;
}
