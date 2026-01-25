import type { AuthProvider } from 'react-admin';

export const authProvider: AuthProvider = {
    login: ({ username }) => {
        // Spec says "API Key" single field. We'll map 'username' input to the key.
        if (!username) return Promise.reject();
        localStorage.setItem('x-admin-key', username);
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem('x-admin-key');
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('x-admin-key');
            return Promise.reject();
        }
        // catch network errors or others
        return Promise.resolve();
    },
    checkAuth: () => {
        return localStorage.getItem('x-admin-key')
            ? Promise.resolve()
            : Promise.reject();
    },
    getPermissions: () => Promise.resolve(),
};
