// API Configuration constants
export const API_CONFIG = {
    AUTH_HEADER: 'X-API-Key',
    AUTH_STORAGE_KEY: 'x-api-key',
    getBaseUrl: () => import.meta.env.VITE_API_URL || 'http://localhost:8000',
} as const;
