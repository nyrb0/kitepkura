export const routers = {
    main: '/',
    admin: {
        posts: '/admin/post',
        editPost: (slug: string) => `/admin/post/edit/${slug}`,
    },
    post: {
        viewSlug: (slug: string) => `/${slug}`,
    },
};
