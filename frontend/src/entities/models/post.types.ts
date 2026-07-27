export interface IPostFile {
    id: string;
    post_id: string;
    original_name: string;
    mime_type: string;
    size: number;
    path: string;
    createdAt: string;
    updatedAt: string;
}

export interface IlocalizedLanguage {
    ru: string;
    kg: string;
}

export interface IPost {
    id: string;
    slug: string;
    name: IlocalizedLanguage;
    description: IlocalizedLanguage;
    urlForm: string;
    urlClicks: number;
    archive_description?: string;
    createdAt: string;
    updatedAt: string;
    isArchive: boolean;
    postFiles: IPostFile[];
    viewsCount: number;
}

export interface IPostsResponse {
    data: IPost[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export type ITopPostItem = Omit<IPost, 'urlForm' | 'archive_description' | 'updatedAt' | 'isArchive' | 'postFiles'>;
