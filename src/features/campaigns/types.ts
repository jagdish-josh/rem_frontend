export interface EmailType {
    id: number;
    key: string;
    description?: string;
}

export interface EmailTemplate {
    id: number;
    organization_id: number;
    email_type_id: number;
    name: string;
    subject: string;
    preheader?: string;
    from_name?: string;
    from_email: string;
    reply_to?: string;
    html_body?: string;
    text_body?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateEmailTemplateDTO {
    email_type_id: number;
    name: string;
    subject: string;
    preheader?: string;
    from_name?: string;
    from_email: string;
    reply_to?: string;
    html_body?: string;
    text_body?: string;
}

export interface Audience {
    id: number;
    organization_id: number;
    name: string;
    bhk_type_id: number | null;
    furnishing_type_id: number | null;
    location_id: number | null;
    property_type_id: number | null;
    power_backup_type_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateAudienceDTO {
    name: string;
    bhk_type_id?: number | null;
    furnishing_type_id?: number | null;
    location_id?: number | null;
    property_type_id?: number | null;
    power_backup_type_id?: number | null;
}
