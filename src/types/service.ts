export interface Service {
    id: number;
    name: string;
    description?: string;
    base_price?: number;
    duration_minutes?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
