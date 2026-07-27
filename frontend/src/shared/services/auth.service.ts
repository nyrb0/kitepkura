import { removeFromStorage, saveAccessTokenStorage } from '../cookie/token.service';
import { axiosService } from '../http/http';
import { API_ROUTES } from './api-routes';

export const authService = {
    async login(data: any) {
        const res = await axiosService.post<any>(API_ROUTES.auth.login, data);
        if (res.data.accessToken) {
            saveAccessTokenStorage(res.data.accessToken);
        }
        return res;
    },
};
