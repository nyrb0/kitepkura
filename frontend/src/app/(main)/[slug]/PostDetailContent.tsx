'use client';

import { useTranslation } from 'react-i18next';

import ClientPdfViewer from '@/components/ClientPdfViewer';
import SocialShare from '@/components/SocialShare';

import PostViewTracker from './PostViewTracker';
import ApplyButton from './ApplyButton';

import { IPost } from '@/entities/models/post.types';

interface Props {
    post: IPost;
    slug: string;
}

const fileUrl = (path: string) => `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:2000'}/${path.replace(/\\/g, '/')}`;

export default function PostDetailContent({ post, slug }: Props) {
    const { t, i18n } = useTranslation();

    const getLocalized = (value: { ru: string; ky?: string; kg?: string }) => {
        return value[i18n.language as keyof typeof value] || value.ru;
    };

    const title = getLocalized(post.name);
    const subtitle = getLocalized(post.description);

    const formUrl = post.urlForm;

    const badge = post.isArchive ? t('post.archive') : t('post.open');

    const date = new Date(post.createdAt);

    const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    return (
        <div className='min-h-screen bg-background text-text'>
            <PostViewTracker slug={slug} />

            <main id='konkurs' className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 pb-24 sm:gap-8 sm:px-6 sm:py-10 lg:px-8 lg:py-16 lg:pb-16'>
                <section className='rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-8 lg:p-10'>
                    <div className='mb-3 flex flex-wrap items-center gap-2'>
                        <p className='inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 sm:text-sm'>{badge}</p>

                        <p className='inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-text-muted sm:text-sm'>
                            {t('post.views')}: {(post.viewsCount ?? 0).toLocaleString('ru-RU')}
                        </p>
                    </div>

                    <h1 className='text-2xl font-semibold leading-tight text-text sm:text-3xl lg:text-4xl'>{title}</h1>

                    <p className='mt-3 max-w-3xl text-base text-text-muted sm:mt-4 sm:text-lg'>{subtitle}</p>

                    {!post.isArchive && <ApplyButton slug={post.slug} formUrl={formUrl} initialClicks={post.urlClicks ?? 0} />}

                    <div className='mt-6 flex justify-end border-t border-border pt-4'>
                        <div className='flex items-center gap-2 text-sm text-text-muted'>
                            <span>
                                {t('post.published')}: <span className='font-medium text-text'>{formattedDate}</span>
                            </span>
                        </div>
                    </div>
                </section>

                <section className='flex flex-col gap-6 sm:gap-8'>
                    {post.postFiles.length > 0 && (
                        <div className='rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-6'>
                            {post.postFiles.map((file, index) => (
                                <div key={file.id} className={index > 0 ? 'mt-10' : ''}>
                                    <h2 className='mb-3 text-lg font-semibold text-text sm:text-xl'>{file.original_name}</h2>

                                    <ClientPdfViewer fileUrl={fileUrl(file.path)} fileName={file.original_name} />
                                </div>
                            ))}
                        </div>
                    )}

                    {!post.isArchive && (
                        <div className='rounded-2xl border border-border bg-neutral-900 p-6 text-white shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-8'>
                            <h2 className='text-xl font-semibold sm:text-2xl'>{t('post.participate')}</h2>

                            <p className='mt-3 text-sm leading-6 text-slate-300'>{t('post.description')}</p>

                            <a
                                href={formUrl}
                                target='_blank'
                                rel='noreferrer'
                                className='mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-7 py-5 text-lg font-bold text-white'
                            >
                                {t('post.apply')}
                            </a>
                        </div>
                    )}

                    {post.isArchive && post.archive_description && (
                        <div className='rounded-2xl border border-border bg-neutral-100 p-6 text-text-muted shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-8'>
                            <p className='text-xs uppercase tracking-[0.3em]'>{t('post.archive')}</p>

                            <p className='mt-3 text-sm leading-6'>{post.archive_description}</p>
                        </div>
                    )}
                </section>

                <SocialShare title={title} description={subtitle} />
            </main>
        </div>
    );
}
