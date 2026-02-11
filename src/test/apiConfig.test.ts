import { describe, it, expect } from 'vitest';
import { API_CONFIG } from '../config/api';

describe('API_CONFIG', () => {
    it('should have admin auth header as X-Admin-Key', () => {
        expect(API_CONFIG.ADMIN_AUTH_HEADER).toBe('X-Admin-Key');
    });

    it('should have admin storage key as x-admin-key', () => {
        expect(API_CONFIG.ADMIN_AUTH_STORAGE_KEY).toBe('x-admin-key');
    });

    it('should have API auth header as X-API-Key', () => {
        expect(API_CONFIG.API_AUTH_HEADER).toBe('X-API-Key');
    });

    it('should have API storage key as x-api-key', () => {
        expect(API_CONFIG.API_AUTH_STORAGE_KEY).toBe('x-api-key');
    });

    it('should return default base URL when env var is not set', () => {
        expect(API_CONFIG.getBaseUrl()).toBe('http://localhost:8000');
    });

    it('should have 5 order statuses', () => {
        expect(API_CONFIG.ORDER_STATUSES).toHaveLength(5);
    });

    it('should contain all expected order statuses', () => {
        const statusIds = API_CONFIG.ORDER_STATUSES.map(s => s.id);
        expect(statusIds).toContain('pending');
        expect(statusIds).toContain('confirmed');
        expect(statusIds).toContain('in_progress');
        expect(statusIds).toContain('completed');
        expect(statusIds).toContain('cancelled');
    });

    it('should have human-readable names for statuses', () => {
        const pending = API_CONFIG.ORDER_STATUSES.find(s => s.id === 'pending');
        expect(pending?.name).toBe('Pending');

        const inProgress = API_CONFIG.ORDER_STATUSES.find(s => s.id === 'in_progress');
        expect(inProgress?.name).toBe('In Progress');
    });
});
