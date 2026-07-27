import { IVisitsStats } from '@/entities/models/visits.types';
import { axiosService, axiosServiceAuth } from '../http/http';
import { API_ROUTES } from './api-routes';

export const visitsService = {
    track: async () => {
        const res = await axiosService.get<any>(API_ROUTES.visits.track);
        return res;
    },
    stats: async () => {
        const res = await axiosServiceAuth.get<IVisitsStats>(API_ROUTES.visits.stats);
        return res.data;
    },
};
