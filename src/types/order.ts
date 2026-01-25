export interface Order {
    id: number;
    status: string;
    amount: number;
    notes?: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}
