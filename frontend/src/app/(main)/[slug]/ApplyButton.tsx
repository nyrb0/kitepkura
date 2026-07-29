'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postService } from '@/shared/services/post.service'; // Замени импорт на свой путь
import { useTranslation } from 'react-i18next';

interface ApplyButtonProps {
    slug: string;
    formUrl: string;
    initialClicks: number;
}

export default function ApplyButton({ slug, formUrl, initialClicks }: ApplyButtonProps) {
    const [clicksCount, setClicksCount] = useState(initialClicks);
    const { t } = useTranslation();
    const { mutate } = useMutation({
        mutationFn: async () => {
            return await postService.clickUrl(slug);
        },
        onSuccess: () => {
            // Запоминаем в сессии, что именно этот пост был кликнут
            sessionStorage.setItem(`clicked_post_${slug}`, 'true');
        },
        onError: error => {
            console.error('Ошибка трекинга клика:', error);
            // При ошибке откатываем локальный счетчик назад
            setClicksCount(prev => Math.max(0, prev - 1));
        },
    });

    const handleClick = () => {
        const hasClicked = sessionStorage.getItem(`clicked_post_${slug}`);

        if (!hasClicked) {
            // Оптимистично увеличиваем цифру в UI
            setClicksCount(prev => prev + 1);
            mutate();
        }
    };

    return (
        <div className='mt-5 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3'>
            <a
                href={formUrl}
                rel='noreferrer'
                onClick={handleClick}
                className='inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-4 text-base font-semibold text-brand-foreground shadow-lg shadow-brand/20 ring-1 ring-brand/20 transition hover:bg-brand-hover hover:shadow-xl sm:w-auto sm:min-w-[180px] sm:text-lg'
            >
                Арыз берүү
            </a>

            {/* Бейджик с количеством кликов */}
            <span className='inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-text-muted sm:text-sm'>
                <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M15 15l-2 5l-2.2-3.3L7.5 20l-1.5-1.5l3.3-3.3L6 13l5-2z' />
                    <path d='M13 13l6-6' />
                    <path d='M21 3l-7 2l2 2l-3 3l1.5 1.5l3-3l2 2l2-7z' />
                </svg>
                {t('post.clicks', {
                    count: clicksCount.toLocaleString('ru-RU'),
                })}
            </span>
        </div>
    );
}
