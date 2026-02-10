import type { DataProvider } from 'react-admin';
import { fetchUtils } from 'react-admin';
import queryString from 'query-string';
import { API_CONFIG } from '../config/api';

/**
 * Determines the correct auth header and token for a given resource.
 * /services uses X-API-Key, /admin/* uses X-Admin-Key
 */
const getAuthForResource = (resource: string): { header: string; token: string | null } => {
    if (resource === 'services') {
        return {
            header: API_CONFIG.API_AUTH_HEADER,
            token: localStorage.getItem(API_CONFIG.API_AUTH_STORAGE_KEY),
        };
    }
    return {
        header: API_CONFIG.ADMIN_AUTH_HEADER,
        token: localStorage.getItem(API_CONFIG.ADMIN_AUTH_STORAGE_KEY),
    };
};

const httpClient = (url: string, options: fetchUtils.Options = {}, resource?: string) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const headers = options.headers as Headers;

    const { header, token } = getAuthForResource(resource || '');
    if (token) {
        headers.set(header, token);
    }

    // For services resource, also send admin key if available (fallback)
    if (resource === 'services') {
        const apiToken = localStorage.getItem(API_CONFIG.API_AUTH_STORAGE_KEY);
        if (apiToken) {
            headers.set(API_CONFIG.API_AUTH_HEADER, apiToken);
        }
    }

    return fetchUtils.fetchJson(url, options);
};

/**
 * Extracts the data array from the API response wrapper.
 * API returns: { users: [...], total: N } or { orders: [...], total: N } or { services: [...], total: N }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractListData = (json: Record<string, any>, resource: string): { data: any[]; total: number } => {
    const key = resource.split('/').pop() || resource;
    const data = json[key] || [];
    const total = json.total ?? data.length;
    return { data, total };
};

/**
 * Builds query params for sorting.
 * react-admin: { field: 'created_at', order: 'DESC' } → API: { sort_by: 'created_at', order: 'desc' }
 */
const buildSortParams = (sort?: { field: string; order: string }): Record<string, string> => {
    if (!sort || !sort.field) return {};
    return {
        sort_by: sort.field,
        order: sort.order.toLowerCase(),
    };
};

/**
 * Maps react-admin filter params to API filter params.
 * For orders: { status: 'pending' } → { status_filter: 'pending' }
 */
const buildFilterParams = (filter: Record<string, unknown>, resource: string): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filter)) {
        if (value === '' || value === null || value === undefined) continue;
        if (resource === 'admin/orders' && key === 'status') {
            result['status_filter'] = value;
        } else {
            result[key] = value;
        }
    }
    return result;
};

export const dataProvider: DataProvider = {
    getList: async (resource, params) => {
        const { page = 1, perPage = 10 } = params.pagination || {};
        const skip = (page - 1) * perPage;
        const limit = perPage;

        const query: Record<string, unknown> = {
            skip,
            limit,
            ...buildSortParams(params.sort),
            ...buildFilterParams(params.filter || {}, resource),
        };

        const apiUrl = API_CONFIG.getBaseUrl();
        const url = `${apiUrl}/${resource}?${queryString.stringify(query)}`;

        const { json } = await httpClient(url, {}, resource);
        return extractListData(json, resource);
    },

    getOne: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {}, resource);
        return { data: json };
    },

    getMany: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        const responses = await Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {}, resource).then(({ json }) => json)
            )
        );
        return { data: responses };
    },

    getManyReference: async (resource, params) => {
        const { page = 1, perPage = 10 } = params.pagination || {};
        const skip = (page - 1) * perPage;
        const limit = perPage;

        const query: Record<string, unknown> = {
            skip,
            limit,
            ...buildSortParams(params.sort),
            [params.target]: params.id,
            ...buildFilterParams(params.filter || {}, resource),
        };

        const apiUrl = API_CONFIG.getBaseUrl();
        const url = `${apiUrl}/${resource}?${queryString.stringify(query)}`;

        const { json } = await httpClient(url, {}, resource);
        return extractListData(json, resource);
    },

    update: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify(params.data),
        }, resource);
        return { data: json };
    },

    updateMany: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        await Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(params.data),
                }, resource)
            )
        );
        return { data: params.ids };
    },

    create: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        const { json } = await httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }, resource);
        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { ...params.data, id: json.id ?? json.user_id ?? json.order_id } as any,
        };
    },

    delete: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }, resource);
        return { data: json || { id: params.id } };
    },

    deleteMany: async (resource, params) => {
        const apiUrl = API_CONFIG.getBaseUrl();
        await Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                }, resource)
            )
        );
        return { data: params.ids };
    },
};
