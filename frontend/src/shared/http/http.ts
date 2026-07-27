import axios from 'axios';
import { getAccessToken, removeFromStorage } from '../cookie/token.service';
import { authService } from '../services/auth.service';

export const BASE_URL: string = process.env.NEXT_PUBLIC_API_BACKEND || 'http://localhost:2000';

const setting = {
    baseURL: `${BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
};

export const axiosService = axios.create(setting);
export const axiosServiceAuth = axios.create(setting);

axiosServiceAuth.interceptors.request.use(config => {
    const accessToken = getAccessToken();

    if (config.headers && accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        config.headers.delete('Content-Type');
    }

    return config;
});

axiosServiceAuth.interceptors.response.use(
    config => config,
    async error => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const message = errorCatch(error);

        if (originalRequest && !originalRequest._isRetry && (status === 401 || message === 'jwt expired' || message === 'jwt must be provided')) {
            originalRequest._isRetry = true;

            try {
                removeFromStorage();
                return axiosServiceAuth.request(originalRequest);
            } catch (refreshError) {
                removeFromStorage();
                return Promise.reject(refreshError);
            }
        }

        throw error;
    },
);

export const errorCatch = (error: any): string => {
    const message = error?.response?.data?.message;

    return message ? (typeof error.response.data.message === 'object' ? message[0] : message) : error.message;
};
