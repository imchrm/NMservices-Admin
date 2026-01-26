import type { DataProvider } from 'react-admin';
import { fetchUtils } from 'react-admin';
import queryString from 'query-string';

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8000';

const httpClient = (url: string, options: any = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('x-admin-key');
    if (token) {
        options.headers.set('X-API-Key', token);
    }
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider: DataProvider = {
    getList: async (resource, params) => {
        const { page = 1, perPage = 10 } = params.pagination || {};
        const skip = (page - 1) * perPage;
        const limit = perPage;

        const query = {
            skip,
            limit,
            ...params.filter,
        };
        const apiUrl = getApiUrl();
        const url = `${apiUrl}/${resource}?${queryString.stringify(query)}`;

        const { json } = await httpClient(url);
        // resource might be 'admin/users' -> extract 'users'
        const key = resource.split('/').pop();
        // Default to resource name if logic fails or specific keys required
        // Spec says: { users: [...], total: 100 }
        let data = [];
        if (key && json[key]) {
            data = json[key];
        } else if (json.users) {
            data = json.users;
        } else if (json.orders) {
            data = json.orders;
        }
        return {
            data: data,
            total: json.total,
        };
    },

    getOne: (resource, params) => {
        const apiUrl = getApiUrl();
        return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        }));
    },

    getMany: (resource, params) => {
        const apiUrl = getApiUrl();
        // Fallback to multiple requests as no endpoint specified in spec for getMany
        return Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`).then(({ json }) => json)
            )
        ).then(responses => ({ data: responses }));
    },

    getManyReference: (resource, params) => {
        const { page = 1, perPage = 10 } = params.pagination || {};
        const skip = (page - 1) * perPage;
        const limit = perPage;

        const query = {
            skip,
            limit,
            [params.target]: params.id,
            ...params.filter,
        };
        const apiUrl = getApiUrl();
        const url = `${apiUrl}/${resource}?${queryString.stringify(query)}`;

        return httpClient(url).then(({ json }) => {
            const key = resource.split('/').pop();
            let data = [];
            if (key && json[key]) {
                data = json[key];
            } else if (json.users) {
                data = json.users;
            } else if (json.orders) {
                data = json.orders;
            }
            return {
                data: data,
                total: json.total,
            };
        });
    },

    update: (resource, params) => {
        const apiUrl = getApiUrl();
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },


    updateMany: (resource, params) => {
        const apiUrl = getApiUrl();
        return Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(params.data),
                })
            )
        ).then(() => ({ data: params.ids }));
    },

    create: (resource, params) => {
        const apiUrl = getApiUrl();
        return httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...params.data, id: json.id } as any,
        }));
    },

    delete: (resource, params) => {
        const apiUrl = getApiUrl();
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({ data: json }));
    },

    deleteMany: (resource, params) => {
        // Not implemented in spec, likely not supported or loop needed
        const apiUrl = getApiUrl();
        return Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                })
            )
        ).then(() => ({ data: params.ids }));
    }
};
