import axios from 'axios';
import { Platform } from 'react-native';

// 실기기: 개발 장비의 실제 IP 사용
const BASE_URL = Platform.select({
    android: 'http://10.0.2.2:3000',
    default: 'https://bssm-api.zer0base.me',
});


const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// 모든 요청 전에 실행 — 추후 토큰 주입, 로깅 등을 여기서 처리
apiClient.interceptors.request.use(
    config => {

        const method = (config.method ?? 'get').toUpperCase();
        console.log(`${method} ${config.url}`);
        // TODO: 인증 토큰이 생기면 여기서 주입
        // const token = getToken();
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => Promise.reject(error),
);

// Response Interceptor
// 모든 응답 후에 실행 — 에러 코드를 한 곳에서 처리
apiClient.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status;
        if (status === 404) {
            console.warn('[API] 404: 요청한 리소스를 찾을 수 없습니다.');
        } else if (status === 401) {
            console.warn('[API] 401: 인증이 필요합니다.');
        } else if (status != null) {
            console.warn(`[API] HTTP ${status}: 요청 처리 중 오류가 발생했습니다.`);
        } else {
            console.warn('[API] 네트워크 오류 또는 응답 없음:', error.message);
        }
        return Promise.reject(error);
    },
);

export default apiClient;
