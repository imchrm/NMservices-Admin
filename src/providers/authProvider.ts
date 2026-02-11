import type { AuthProvider } from 'react-admin';
import { API_CONFIG } from '../config/api';

export const authProvider: AuthProvider = {
    login: (params) => {
        const { username } = params;
        if (!username) return Promise.reject(new Error('Username is required'));
        localStorage.setItem(API_CONFIG.ADMIN_AUTH_STORAGE_KEY, username);
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem(API_CONFIG.ADMIN_AUTH_STORAGE_KEY);
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem(API_CONFIG.ADMIN_AUTH_STORAGE_KEY);
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: () => {
        return localStorage.getItem(API_CONFIG.ADMIN_AUTH_STORAGE_KEY)
            ? Promise.resolve()
            : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),
};
