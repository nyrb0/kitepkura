'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface LocalizedString {
    ru: string;
    ky?: string;
    kg?: string;
}

interface PostFile {
    id: string;
    original_name: string;
    mime_type: string;
    size: number;
    path: string;
}

interface Post {
    id: string;
    slug: string;
    name: LocalizedString;
    description: LocalizedString;
    urlForm: string;
    urlClicks: number;
    isArchive: boolean;
    postFiles: PostFile[];
    createdAt: string;
    viewsCount: number;
}

interface Props {
    posts: Post[];
}

function formatDate(isoString: string) {
    const date = new Date(isoString);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month} ${hours}:${minutes}`;
}

export default function HomeContent({ posts }: Props) {
    const { t, i18n } = useTranslation();

    const getLocalized = (value: LocalizedString) => {
        return value[i18n.language as keyof LocalizedString] || value.ru;
    };

    return (
        <main className='min-h-screen bg-background text-text transition-colors duration-300'>
            <section className='mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
                {/* Баннер / Заголовок */}
                <div className='rounded-2xl border border-border/80 bg-surface p-5 shadow-card transition-all duration-300 sm:p-8 hover:shadow-md'>
                    <p className='text-xs font-bold uppercase tracking-[0.15em] text-brand'>{t('home.brand')}</p>
                    <h1 className='mt-3 text-2xl font-bold tracking-tight text-text sm:text-3xl'>{t('home.title')}</h1>
                </div>

                {/* Список постов */}
                {posts.length === 0 ? (
                    <div className='rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center text-neutral-500 transition-all duration-300'>
                        {t('home.empty')}
                    </div>
                ) : (
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {posts.map(post => (
                            <Link
                                key={post.id}
                                href={`/${i18n.language}/${post.slug}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl active:scale-[0.99]'
                            >
                                <div>
                                    <div className='flex items-center gap-2 text-xs font-medium text-neutral-400 transition-colors duration-200 group-hover:text-neutral-500'>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>

                                    <h2 className='mt-3 line-clamp-2 text-xl font-bold text-text transition-colors duration-200 group-hover:text-brand'>
                                        {getLocalized(post.name)}
                                    </h2>

                                    <p className='mt-3 line-clamp-3 text-sm text-neutral-600 transition-colors duration-200'>
                                        {getLocalized(post.description)}
                                    </p>

                                    {post.postFiles.length > 0 && (
                                        <p className='mt-4 flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors duration-200 group-hover:text-neutral-500'>
                                            <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth='2'
                                                    d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                                                />
                                            </svg>
                                            {t('home.attachedFiles', {
                                                count: post.postFiles.length,
                                            })}
                                        </p>
                                    )}
                                </div>

                                <div className='mt-6'>
                                    <div className='flex w-full items-center justify-center rounded-xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-text transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:shadow-md group-hover:shadow-brand/20'>
                                        <span>{t('home.viewDetails')}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
