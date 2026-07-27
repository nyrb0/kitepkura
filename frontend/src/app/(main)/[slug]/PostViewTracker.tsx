'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // 1. Импортируем роутер
import { useMutation } from '@tanstack/react-query';
import { usePostViewStore } from '@/store/usePostViewStore';
import { postService } from '@/shared/services/post.service';

interface PostViewTrackerProps {
    slug: string;
}

export default function PostViewTracker({ slug }: PostViewTrackerProps) {
    const router = useRouter(); // 2. Инициализируем
    const registerPostView = usePostViewStore(state => state.registerPostView);
    const isViewed = usePostViewStore(state => state.viewedSlugs.includes(slug));

    const hasTriggeredRef = useRef(false);

    const { mutate } = useMutation({
        mutationFn: (postSlug: string) => postService.registerView(postSlug),
        onSuccess: () => {
            registerPostView(slug);

            // 3. Обновляем серверные данные страницы (перевызывает getPostBySlug на сервере)
            router.refresh();
        },
        onError: error => {
            console.error('Ошибка при регистрации просмотра:', error);
            hasTriggeredRef.current = false;
        },
    });

    useEffect(() => {
        if (slug && !isViewed && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            mutate(slug);
        }
    }, [slug, isViewed, mutate]);

    return null;
}
