export const API_ROUTES = {
    auth: {
        login: '/auth/login',
    },
    post: {
        create: '/posts',
        getPost: '/posts',
        registerView: (slug: string) => `/posts/register-view/${slug}`,
        topViewed: '/posts/top-viewed',
        clickUrl: (slug: string) => `/posts/${slug}/click-url`,
        stats: (slug: string) => `/posts/${slug}/stats`,
    },
    visits: {
        track: '/visits/track',
        stats: '/visits/stats',
    },
};
