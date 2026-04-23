import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import User from '@type/User';
import {
    signup,
    login,
    logout,
    refreshToken as authRefresh,
    SignupPayload,
    LoginPayload,
} from '@/api/auth';
import { getMe } from '@/api/users';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    status: AuthStatus;
    loading: boolean;
    error: string | null;

    bootstrap: () => Promise<void>;
    signUp: (payload: SignupPayload) => Promise<void>;
    logIn: (payload: LoginPayload) => Promise<void>;
    logOut: () => Promise<void>;
    refreshAccessToken: () => Promise<string>;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'checking',
    loading: false,
    error: null,

    bootstrap: async () => {
        try {
            const storedAccess = await SecureStore.getItemAsync(TOKEN_KEY);
            const storedRefresh = await SecureStore.getItemAsync(REFRESH_KEY);

            if (!storedAccess) {
                set({ status: 'guest' });
                return;
            }

            set({
                accessToken: storedAccess,
                refreshToken: storedRefresh,
            });

            const user = await getMe();
            set({ user, status: 'authenticated' });
        } catch {
            await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
            await SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {});
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                status: 'guest',
            });
        }
    },

    signUp: async payload => {
        set({ loading: true, error: null });
        try {
            const res = await signup(payload);
            await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
            await SecureStore.setItemAsync(REFRESH_KEY, res.refreshToken);
            set({
                user: res.user,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                status: 'authenticated',
                loading: false,
            });
        } catch (err: unknown) {
            const serverRes = (
                err as { response?: { data?: { message?: string } } }
            ).response;
            const message = serverRes
                ? (serverRes.data?.message ?? '회원가입에 실패했습니다.')
                : '서버와 통신 중 오류가 발생했습니다.';
            set({ error: message, loading: false });
            throw err;
        }
    },

    logIn: async payload => {
        set({ loading: true, error: null });
        try {
            const res = await login(payload);
            await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
            await SecureStore.setItemAsync(REFRESH_KEY, res.refreshToken);
            set({
                user: res.user,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                status: 'authenticated',
                loading: false,
            });
        } catch (err: unknown) {
            const serverRes = (
                err as { response?: { data?: { message?: string } } }
            ).response;
            const message = serverRes
                ? (serverRes.data?.message ?? '로그인에 실패했습니다.')
                : '서버와 통신 중 오류가 발생했습니다.';
            set({ error: message, loading: false });
            throw err;
        }
    },

    logOut: async () => {
        const currentRefresh = get().refreshToken;

        // 서버 폐기 요청은 fire-and-forget (실패해도 로컬 정리는 반드시 수행)
        if (currentRefresh) {
            logout(currentRefresh).catch(() => {});
        }

        // 순서 중요: SecureStore 삭제 → store 초기화
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        await SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {});

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            status: 'guest',
            error: null,
        });
    },

    refreshAccessToken: async () => {
        const currentRefresh = get().refreshToken;
        if (!currentRefresh) {
            throw new Error('No refresh token');
        }

        const res = await authRefresh(currentRefresh);

        await SecureStore.setItemAsync(TOKEN_KEY, res.accessToken);
        await SecureStore.setItemAsync(REFRESH_KEY, res.refreshToken);

        set({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
        });

        return res.accessToken;
    },

    setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
    },

    clearError: () => set({ error: null }),
}));
