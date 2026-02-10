export interface Order {
    id: number;
    user_id: number;
    service_id?: number;
    status: string;
    total_amount?: number;
    address_text?: string;
    scheduled_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}
