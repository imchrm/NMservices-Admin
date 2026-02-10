import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dataProvider } from '../providers/dataProvider';

// Mock fetchUtils.fetchJson
vi.mock('react-admin', () => ({
    fetchUtils: {
        fetchJson: vi.fn(),
    },
}));

import { fetchUtils } from 'react-admin';
const mockFetchJson = vi.mocked(fetchUtils.fetchJson);

const mockResponse = (json: unknown) => ({
    json,
    headers: new Headers(),
    status: 200,
    body: '',
});

describe('dataProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('x-admin-key', 'test-admin-key');
        localStorage.setItem('x-api-key', 'test-api-key');
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('getList', () => {
        it('should convert pagination to skip/limit', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ users: [{ id: 1 }], total: 1 }));

            await dataProvider.getList('admin/users', {
                pagination: { page: 2, perPage: 25 },
                sort: { field: 'id', order: 'ASC' },
                filter: {},
            });

            const calledUrl = mockFetchJson.mock.calls[0][0] as string;
            expect(calledUrl).toContain('skip=25');
            expect(calledUrl).toContain('limit=25');
        });

        it('should include sort params (sort_by and order)', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ users: [], total: 0 }));

            await dataProvider.getList('admin/users', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'created_at', order: 'DESC' },
                filter: {},
            });

            const calledUrl = mockFetchJson.mock.calls[0][0] as string;
            expect(calledUrl).toContain('sort_by=created_at');
            expect(calledUrl).toContain('order=desc');
        });

        it('should map orders status filter to status_filter', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ orders: [], total: 0 }));

            await dataProvider.getList('admin/orders', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'id', order: 'ASC' },
                filter: { status: 'pending' },
            });

            const calledUrl = mockFetchJson.mock.calls[0][0] as string;
            expect(calledUrl).toContain('status_filter=pending');
            expect(calledUrl).not.toContain('status=pending');
        });

        it('should extract data from response wrapper (users)', async () => {
            const mockUsers = [
                { id: 1, phone_number: '+1234567890' },
                { id: 2, phone_number: '+0987654321' },
            ];
            mockFetchJson.mockResolvedValue(mockResponse({ users: mockUsers, total: 2 }));

            const result = await dataProvider.getList('admin/users', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'id', order: 'ASC' },
                filter: {},
            });

            expect(result.data).toEqual(mockUsers);
            expect(result.total).toBe(2);
        });

        it('should extract data from response wrapper (services)', async () => {
            const mockServices = [
                { id: 1, name: 'Massage', base_price: 150000 },
            ];
            mockFetchJson.mockResolvedValue(mockResponse({ services: mockServices, total: 1 }));

            const result = await dataProvider.getList('services', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'id', order: 'ASC' },
                filter: {},
            });

            expect(result.data).toEqual(mockServices);
            expect(result.total).toBe(1);
        });

        it('should skip empty filter values', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ orders: [], total: 0 }));

            await dataProvider.getList('admin/orders', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'id', order: 'ASC' },
                filter: { status: '', notes: null },
            });

            const calledUrl = mockFetchJson.mock.calls[0][0] as string;
            expect(calledUrl).not.toContain('status_filter');
            expect(calledUrl).not.toContain('notes');
        });
    });

    describe('getOne', () => {
        it('should fetch a single resource', async () => {
            const mockUser = { id: 1, phone_number: '+1234567890' };
            mockFetchJson.mockResolvedValue(mockResponse(mockUser));

            const result = await dataProvider.getOne('admin/users', { id: 1 });

            expect(result.data).toEqual(mockUser);
            const calledUrl = mockFetchJson.mock.calls[0][0] as string;
            expect(calledUrl).toContain('/admin/users/1');
        });
    });

    describe('getMany', () => {
        it('should fetch multiple resources by ids', async () => {
            mockFetchJson
                .mockResolvedValueOnce(mockResponse({ id: 1, phone_number: '+111' }))
                .mockResolvedValueOnce(mockResponse({ id: 2, phone_number: '+222' }));

            const result = await dataProvider.getMany('admin/users', { ids: [1, 2] });

            expect(result.data).toHaveLength(2);
            expect(result.data[0].id).toBe(1);
            expect(result.data[1].id).toBe(2);
        });
    });

    describe('create', () => {
        it('should POST new resource', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ id: 5, phone_number: '+1234567890' }));

            const result = await dataProvider.create('admin/users', {
                data: { phone_number: '+1234567890' },
            });

            expect(result.data.id).toBe(5);
            const options = mockFetchJson.mock.calls[0][1] as Record<string, unknown>;
            expect(options.method).toBe('POST');
        });

        it('should handle order_id in create response', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ order_id: 42, status: 'ok', message: 'created' }));

            const result = await dataProvider.create('admin/orders', {
                data: { user_id: 1, status: 'pending' },
            });

            expect(result.data.id).toBe(42);
        });
    });

    describe('update', () => {
        it('should PATCH resource', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ id: 1, status: 'completed' }));

            const result = await dataProvider.update('admin/orders', {
                id: 1,
                data: { status: 'completed' },
                previousData: { id: 1, status: 'pending' },
            });

            expect(result.data.status).toBe('completed');
            const options = mockFetchJson.mock.calls[0][1] as Record<string, unknown>;
            expect(options.method).toBe('PATCH');
        });
    });

    describe('delete', () => {
        it('should DELETE resource', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ status: 'ok', message: 'deleted' }));

            await dataProvider.delete('admin/users', {
                id: 1,
                previousData: { id: 1 },
            });

            const calledUrl = mockFetchJson.mock.calls[0][0] as string;
            expect(calledUrl).toContain('/admin/users/1');
            const options = mockFetchJson.mock.calls[0][1] as Record<string, unknown>;
            expect(options.method).toBe('DELETE');
        });
    });

    describe('deleteMany', () => {
        it('should DELETE multiple resources', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({}));

            const result = await dataProvider.deleteMany('admin/orders', { ids: [1, 2, 3] });

            expect(mockFetchJson).toHaveBeenCalledTimes(3);
            expect(result.data).toEqual([1, 2, 3]);
        });
    });

    describe('auth headers', () => {
        it('should send X-Admin-Key for admin resources', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ users: [], total: 0 }));

            await dataProvider.getList('admin/users', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'id', order: 'ASC' },
                filter: {},
            });

            const options = mockFetchJson.mock.calls[0][1] as { headers: Headers };
            expect(options.headers.get('X-Admin-Key')).toBe('test-admin-key');
        });

        it('should send X-API-Key for services resource', async () => {
            mockFetchJson.mockResolvedValue(mockResponse({ services: [], total: 0 }));

            await dataProvider.getList('services', {
                pagination: { page: 1, perPage: 10 },
                sort: { field: 'id', order: 'ASC' },
                filter: {},
            });

            const options = mockFetchJson.mock.calls[0][1] as { headers: Headers };
            expect(options.headers.get('X-API-Key')).toBe('test-api-key');
        });
    });
});
