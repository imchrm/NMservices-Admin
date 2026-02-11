// API Configuration constants
export const API_CONFIG = {
    // Admin endpoints auth (/admin/*)
    ADMIN_AUTH_HEADER: 'X-Admin-Key',
    ADMIN_AUTH_STORAGE_KEY: 'x-admin-key',

    getBaseUrl: () => import.meta.env.VITE_API_URL || 'http://localhost:8000',

    ORDER_STATUSES: [
        { id: 'pending', name: 'Pending' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'in_progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' },
        { id: 'cancelled', name: 'Cancelled' },
    ],
} as const;
