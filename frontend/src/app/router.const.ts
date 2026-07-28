export const routers = {
    main: '/',
    admin: {
        posts: '/admin/post',
        editPost: (slug: string) => `/admin/post/edit/${slug}`,
        postStats: (slug: string) => `/admin/post/${slug}/stats`,
    },
    post: {
        viewSlug: (slug: string) => `/${slug}`,
    },
};
