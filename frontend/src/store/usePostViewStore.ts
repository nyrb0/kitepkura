import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PostViewStore {
    viewedSlugs: string[];
    registerPostView: (slug: string) => void;
}

export const usePostViewStore = create<PostViewStore>()(
    persist(
        (set, get) => ({
            viewedSlugs: [],

            registerPostView: (slug: string) => {
                const { viewedSlugs } = get();
                if (!viewedSlugs.includes(slug)) {
                    set({ viewedSlugs: [...viewedSlugs, slug] });
                }
            },
        }),
        {
            name: 'post-views-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
