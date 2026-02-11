export interface Contact {
    id: number;
    organization_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
    updated_at: string;
    preferences: {
        id: number;
        contact_id: number;
        bhk_type_id: number | null;
        furnishing_type_id: number | null;
        location_id: number | null;
        property_type_id: number | null;
        power_backup_type_id: number | null;
        created_at: string;
        updated_at: string;
    }[];
}

export interface ReferenceItem {
    id: number;
    name?: string;
    city?: string;
}

export interface PreferenceReferenceData {
    bhk_types: ReferenceItem[];
    furnishing_types: ReferenceItem[];
    property_types: ReferenceItem[];
    locations: ReferenceItem[];
    power_backup_types: ReferenceItem[];
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
    import_id?: string;
}

export interface CSVImportErrorResponse {
    error: string;
    message: string;
}
