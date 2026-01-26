// API Configuration constants
export const API_CONFIG = {
    AUTH_HEADER: 'X-Admin-Key',
    AUTH_STORAGE_KEY: 'x-admin-key',
    getBaseUrl: () => import.meta.env.VITE_API_URL || 'http://localhost:8000',
} as const;
