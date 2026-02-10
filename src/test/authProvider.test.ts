import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authProvider } from '../providers/authProvider';

describe('authProvider', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('login', () => {
        it('should store admin key in localStorage', async () => {
            await authProvider.login({ username: 'my-secret-key' });

            expect(localStorage.getItem('x-admin-key')).toBe('my-secret-key');
        });

        it('should reject when username is empty', async () => {
            await expect(authProvider.login({ username: '' })).rejects.toThrow();
        });
    });

    describe('logout', () => {
        it('should remove admin key from localStorage', async () => {
            localStorage.setItem('x-admin-key', 'test-key');

            await authProvider.logout({});

            expect(localStorage.getItem('x-admin-key')).toBeNull();
        });
    });

    describe('checkAuth', () => {
        it('should resolve when admin key is present', async () => {
            localStorage.setItem('x-admin-key', 'test-key');

            await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
        });

        it('should reject when admin key is absent', async () => {
            await expect(authProvider.checkAuth({})).rejects.toBeUndefined();
        });
    });

    describe('checkError', () => {
        it('should clear auth and reject on 401', async () => {
            localStorage.setItem('x-admin-key', 'test-key');

            await expect(authProvider.checkError({ status: 401 })).rejects.toBeUndefined();
            expect(localStorage.getItem('x-admin-key')).toBeNull();
        });

        it('should clear auth and reject on 403', async () => {
            localStorage.setItem('x-admin-key', 'test-key');

            await expect(authProvider.checkError({ status: 403 })).rejects.toBeUndefined();
            expect(localStorage.getItem('x-admin-key')).toBeNull();
        });

        it('should resolve on other errors', async () => {
            localStorage.setItem('x-admin-key', 'test-key');

            await expect(authProvider.checkError({ status: 500 })).resolves.toBeUndefined();
            expect(localStorage.getItem('x-admin-key')).toBe('test-key');
        });
    });

    describe('getPermissions', () => {
        it('should resolve', async () => {
            const getPerms = authProvider.getPermissions;
            if (getPerms) {
                await expect(getPerms({})).resolves.toBeUndefined();
            }
        });
    });
});
