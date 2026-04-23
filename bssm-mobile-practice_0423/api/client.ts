import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl as string | undefined;

if (!BASE_URL) {
    // 앱 번들에는 URL이 반드시 주입되어야 한다. 누락 시 즉시 드러내 개발 단계에서 발견
    console.error(
        '[API] EXPO_PUBLIC_API_URL 이 설정되지 않았습니다. .env 파일을 확인하세요.',
    );
}

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor — 토큰 주입
apiClient.interceptors.request.use(
    config => {
        // auth-store를 직접 import하면 순환 참조가 생기므로 동적으로 참조
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/store/auth-store');
        const token: string | null = useAuthStore.getState().accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => Promise.reject(error),
);

// Refresh 중복 호출 방지용 상태
let isRefreshing = false;
type PendingRequest = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};
let pendingQueue: PendingRequest[] = [];

const flushQueue = (err: unknown, token: string | null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (err || !token) reject(err);
        else resolve(token);
    });
    pendingQueue = [];
};

// Response Interceptor — 에러 분기 + 401 시 refresh 재시도
apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalConfig = error.config as
            | (AxiosRequestConfig & { _retry?: boolean })
            | undefined;

        if (status === 404) {
            console.warn(
                '[API] 리소스를 찾을 수 없습니다:',
                originalConfig?.url,
            );
            return Promise.reject(error);
        }

        if (status === 401 && originalConfig && !originalConfig._retry) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useAuthStore } = require('@/store/auth-store');
            const store = useAuthStore.getState();

            // refresh token 자체가 없으면 갱신 불가 → 로그아웃
            if (!store.refreshToken) {
                await store.logOut();
                return Promise.reject(error);
            }

            originalConfig._retry = true;

            // 이미 갱신 중이면 큐에 대기
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: (token: string) => {
                            originalConfig.headers = {
                                ...(originalConfig.headers ?? {}),
                                Authorization: `Bearer ${token}`,
                            };
                            resolve(apiClient(originalConfig));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            try {
                const newToken = await store.refreshAccessToken();
                flushQueue(null, newToken);
                originalConfig.headers = {
                    ...(originalConfig.headers ?? {}),
                    Authorization: `Bearer ${newToken}`,
                };
                return apiClient(originalConfig);
            } catch (refreshErr) {
                flushQueue(refreshErr, null);
                // refresh 자체가 실패 → 세션 종료
                await store.logOut();
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        console.error('[API] 서버 에러:', status, error.message);
        return Promise.reject(error);
    },
);

export default apiClient;
