export interface EmailType {
    id: number;
    name: string;
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
