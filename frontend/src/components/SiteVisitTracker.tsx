'use client';

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { visitsService } from '@/shared/services/visits.service';

export default function SiteVisitTracker() {
    const hasTriggeredRef = useRef(false);

    const { mutate } = useMutation({
        mutationFn: async () => {
            await visitsService.track();
        },
        onSuccess: () => {
            // Помечаем в сессии, что визит засчитан
            sessionStorage.setItem('site_visited', 'true');
        },
        onError: error => {
            console.error('Ошибка трекинга посещения:', error);
            hasTriggeredRef.current = false;
        },
    });

    useEffect(() => {
        // Проверяем, заходил ли пользователь в этой сессии браузера
        const hasVisited = sessionStorage.getItem('site_visited');

        if (!hasVisited && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            mutate();
        }
    }, [mutate]);

    return null;
}
