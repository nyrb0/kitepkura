import { IPost, IPostsResponse } from '@/entities/models/post.types';
import { removeFromStorage, saveAccessTokenStorage } from '../cookie/token.service';
import { axiosService, axiosServiceAuth } from '../http/http';
import { API_ROUTES } from './api-routes';

export const postService = {
    async create(data: any) {
        const res = await axiosServiceAuth.post<any>(API_ROUTES.post.create, data);
        return res;
    },
    async registerView(slug: string) {
        const res = await axiosService.post(API_ROUTES.post.registerView(slug));
        return res;
    },
    async findBySlug(slug: string) {
        const res = await axiosServiceAuth.get<IPost>(`${API_ROUTES.post.getPost}/${slug}`);
        return res;
    },
    async update(slug: string, data: any) {
        const res = await axiosServiceAuth.patch<any>(`${API_ROUTES.post.getPost}/${slug}`, data);
        return res;
    },
    async remove(slug: any) {
        const res = await axiosServiceAuth.delete<any>(`${API_ROUTES.post.create}/${slug}`);
        return res;
    },
    async findAll(page: number, limit: number, isArchive?: boolean) {
        const res = await axiosServiceAuth.get<IPostsResponse>(API_ROUTES.post.getPost, {
            params: { page, limit, isArchive },
        });
        return res.data;
    },
    async topViewed() {
        const res = await axiosServiceAuth.get<any>(API_ROUTES.post.topViewed);
        return res.data;
    },
    async clickUrl(slug: string) {
        const res = await axiosServiceAuth.post<any>(API_ROUTES.post.clickUrl(slug));
        return res.data;
    },
};
