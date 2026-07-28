'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
    FiFileText,
    FiFile,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
    FiCalendar,
    FiPaperclip,
    FiAlertCircle,
    FiPlus,
    FiLoader,
    FiArchive,
    FiRotateCcw,
    FiCheckCircle,
    FiLayers,
    FiBarChart2,
} from 'react-icons/fi';
import { postService } from '@/shared/services/post.service';
import { IPost, IPostsResponse } from '@/entities/models/post.types';
import UIConfirmation from '@/shared/UI/UIСonfirmation';
import { routers } from '@/app/router.const';
import { BiEdit } from 'react-icons/bi';
import { BASE_URL } from '@/shared/http/http';

const LIMIT = 10;

type ArchiveFilter = 'false' | 'true' | 'all';

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

// queryKey теперь зависит и от фильтра архива
const postsQueryKey = (page: number, limit: number, archiveTab: ArchiveFilter) => ['posts', { page, limit, archiveTab }] as const;

const PostsPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [archiveTab, setArchiveTab] = useState<ArchiveFilter>('false');
    const [postToDelete, setPostToDelete] = useState<IPost | null>(null);
    const [postToArchive, setPostToArchive] = useState<IPost | null>(null);

    // Преобразуем таб в значение для API
    const isArchiveParam = archiveTab === 'all' ? undefined : archiveTab === 'true';

    const { data, isPending, isError, error } = useQuery({
        queryKey: postsQueryKey(page, LIMIT, archiveTab),
        queryFn: () => postService.findAll(page, LIMIT, isArchiveParam) as Promise<IPostsResponse>,
        placeholderData: keepPreviousData,
    });

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => postService.remove(slug),
        onSuccess: () => {
            if (data?.data.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                queryClient.invalidateQueries({ queryKey: ['posts'] });
            }
            setPostToDelete(null);
        },
    });

    const archiveMutation = useMutation({
        mutationFn: ({ slug, isArchive }: { slug: string; isArchive: boolean }) => {
            const formData = new FormData();
            formData.append('slug', slug);
            formData.append('isArchive', String(isArchive));
            return postService.update(slug, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            setPostToArchive(null);
        },
    });

    const posts = data?.data ?? [];
    const meta = data?.meta;

    const handleTabChange = (tab: ArchiveFilter) => {
        setArchiveTab(tab);
        setPage(1); // Сбрасываем страницу на первую при смене фильтра
    };

    return (
        <div className='min-h-screen w-full px-4 py-10 pb-[100px sm:py-16'>
            <div className='mx-auto w-full max-w-4xl'>
                {/* Заголовок */}
                <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <div
                            className='flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)]'
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
                                boxShadow: 'var(--shadow-card)',
                            }}
                        >
                            <FiFileText className='h-5 w-5 text-[var(--color-brand-foreground)]' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-bold text-[var(--color-text)] tracking-tight'>Посты</h1>
                            {meta && <p className='text-sm text-[var(--color-text-muted)]'>Всего: {meta.total}</p>}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/admin/post/create')}
                        className='flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold text-[var(--color-brand-foreground)] transition-all'
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <FiPlus className='h-4 w-4' />
                        <span className='hidden sm:inline'>Новый пост</span>
                    </button>
                </div>

                {/* Табы-фильтры (Segmented Control) */}
                <div className='mb-6 flex w-full sm:w-auto items-center gap-1 rounded-[var(--radius-lg)] bg-[var(--color-neutral-100)] p-1 border border-[var(--color-border)]'>
                    <button
                        onClick={() => handleTabChange('false')}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-[var(--radius-md)] px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                            archiveTab === 'false'
                                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                    >
                        <FiCheckCircle className='h-4 w-4' />
                        Активные
                    </button>
                    <button
                        onClick={() => handleTabChange('true')}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-[var(--radius-md)] px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                            archiveTab === 'true'
                                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                    >
                        <FiArchive className='h-4 w-4' />В архиве
                    </button>
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-[var(--radius-md)] px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                            archiveTab === 'all'
                                ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                        }`}
                    >
                        <FiLayers className='h-4 w-4' />
                        Все
                    </button>
                </div>

                {isError && (
                    <div
                        className='mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                        style={{
                            borderColor: 'var(--color-danger-500)',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--color-danger-600)',
                        }}
                    >
                        <FiAlertCircle className='h-4 w-4 shrink-0' />
                        {error instanceof Error ? error.message : 'Не удалось загрузить посты'}
                    </div>
                )}

                {deleteMutation.isError && (
                    <div
                        className='mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                        style={{
                            borderColor: 'var(--color-danger-500)',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--color-danger-600)',
                        }}
                    >
                        <FiAlertCircle className='h-4 w-4 shrink-0' />
                        {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Не удалось удалить пост'}
                    </div>
                )}

                {archiveMutation.isError && (
                    <div
                        className='mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                        style={{
                            borderColor: 'var(--color-danger-500)',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--color-danger-600)',
                        }}
                    >
                        <FiAlertCircle className='h-4 w-4 shrink-0' />
                        {archiveMutation.error instanceof Error ? archiveMutation.error.message : 'Не удалось изменить статус поста'}
                    </div>
                )}

                {/* Список */}
                {isPending ? (
                    <div className='flex items-center justify-center py-20'>
                        <FiLoader className='h-6 w-6 animate-spin text-[var(--color-primary-600)]' />
                    </div>
                ) : posts.length === 0 ? (
                    <div
                        className='rounded-[var(--radius-xl)] border border-dashed px-6 py-16 text-center'
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <p className='text-sm text-[var(--color-text-muted)]'>
                            {archiveTab === 'true' ? 'В архиве пока ничего нет' : archiveTab === 'false' ? 'Активных постов нет' : 'Постов пока нет'}
                        </p>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {posts.map(post => (
                            <div
                                key={post.id}
                                className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]'
                                style={{
                                    boxShadow: 'var(--shadow-card)',
                                    opacity: post.isArchive ? 0.6 : 1,
                                }}
                                // onClick={() => router.push(routers.postId(post.slug))}
                            >
                                <div className='flex items-start justify-between gap-4'>
                                    <div className='min-w-0 flex-1'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <h2 className='text-lg font-semibold text-[var(--color-text)] truncate'>{post.name.ru}</h2>
                                            {post.isArchive && (
                                                <span
                                                    className='shrink-0 rounded-[var(--radius-sm)] px-2 py-0.5 text-xs font-medium'
                                                    style={{
                                                        backgroundColor: 'var(--color-neutral-200)',
                                                        color: 'var(--color-text-muted)',
                                                    }}
                                                >
                                                    В архиве
                                                </span>
                                            )}
                                        </div>
                                        <p className='mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2'>{post.description.ru}</p>

                                        <div className='mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]'>
                                            <span className='flex items-center gap-1.5'>
                                                <FiCalendar className='h-3.5 w-3.5' />
                                                {formatDate(post.createdAt)}
                                            </span>
                                            {post.postFiles.length > 0 && (
                                                <span className='flex items-center gap-1.5'>
                                                    <FiPaperclip className='h-3.5 w-3.5' />
                                                    {post.postFiles.length} {post.postFiles.length === 1 ? 'файл' : 'файла(ов)'}
                                                </span>
                                            )}
                                        </div>

                                        {post.postFiles.length > 0 && (
                                            <ul className='mt-3 flex flex-wrap gap-2'>
                                                {post.postFiles.map(file => (
                                                    <li key={file.id}>
                                                        <a
                                                            href={`${BASE_URL ?? ''}/${file.path.replace(/\\/g, '/')}`}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-xs text-[var(--color-text)] transition-colors hover:bg-[var(--color-neutral-100)]'
                                                            style={{ borderColor: 'var(--color-border)' }}
                                                        >
                                                            <FiFile className='h-3.5 w-3.5 shrink-0' style={{ color: 'var(--color-primary-600)' }} />
                                                            <span className='max-w-[160px] truncate'>{file.original_name}</span>
                                                            <span className='shrink-0 text-[var(--color-text-muted)]'>{formatBytes(file.size)}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className='flex shrink-0 items-center gap-1'>
                                        <button
                                            onClick={() => setPostToArchive(post)}
                                            className='rounded-[var(--radius-md)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text)]'
                                            aria-label={post.isArchive ? 'Восстановить пост' : 'Архивировать пост'}
                                            title={post.isArchive ? 'Восстановить из архива' : 'Отправить в архив'}
                                        >
                                            {post.isArchive ? <FiRotateCcw className='h-4.5 w-4.5' /> : <FiArchive className='h-4.5 w-4.5' />}
                                        </button>

                                        <button
                                            onClick={() => setPostToDelete(post)}
                                            className='rounded-[var(--radius-md)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--color-danger-600)]'
                                            aria-label='Удалить пост'
                                        >
                                            <FiTrash2 className='h-4.5 w-4.5' />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(routers.admin.postStats(post.slug))}
                                    className='mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-neutral-100)]'
                                    style={{ borderColor: 'var(--color-border)' }}
                                >
                                    <FiBarChart2 className='h-4 w-4' style={{ color: 'var(--color-primary-600)' }} />
                                    Посмотреть статистику
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Пагинация */}
                {meta && meta.totalPages > 1 && (
                    <div className='mt-8 flex items-center justify-center gap-2'>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className='flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border text-[var(--color-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-neutral-100)]'
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <FiChevronLeft className='h-4 w-4' />
                        </button>

                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className='flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors'
                                style={
                                    p === page
                                        ? {
                                              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                                              color: 'var(--color-brand-foreground)',
                                          }
                                        : { color: 'var(--color-text)' }
                                }
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className='flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border text-[var(--color-text)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-neutral-100)]'
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <FiChevronRight className='h-4 w-4' />
                        </button>
                    </div>
                )}
            </div>

            {/* Подтверждение удаления */}
            <UIConfirmation
                onOkText='Удалять'
                isOpen={Boolean(postToDelete)}
                title='Удалить пост?'
                isLoading={deleteMutation.isPending}
                onCancel={() => setPostToDelete(null)}
                onOk={() => postToDelete && deleteMutation.mutate(postToDelete.slug)}
                description={
                    postToDelete && (
                        <p>
                            Пост «<span className='font-medium text-[var(--color-text)]'>{postToDelete.name.ru}</span>» будет удалён без возможности
                            восстановления
                            {postToDelete.postFiles.length > 0 && ' вместе со всеми прикреплёнными файлами'}.
                        </p>
                    )
                }
            />

            {/* Подтверждение архивации / восстановления */}
            <UIConfirmation
                onOkText='Архивировать'
                isOpen={Boolean(postToArchive)}
                title={postToArchive?.isArchive ? 'Восстановить пост?' : 'Архивировать пост?'}
                isLoading={archiveMutation.isPending}
                onCancel={() => setPostToArchive(null)}
                onOk={() =>
                    postToArchive &&
                    archiveMutation.mutate({
                        slug: postToArchive.slug,
                        isArchive: !postToArchive.isArchive,
                    })
                }
                description={
                    postToArchive && (
                        <p>
                            {postToArchive.isArchive ? (
                                <>
                                    Пост «<span className='font-medium text-[var(--color-text)]'>{postToArchive.name.ru}</span>» снова станет виден в
                                    общем списке.
                                </>
                            ) : (
                                <>
                                    Пост «<span className='font-medium text-[var(--color-text)]'>{postToArchive.name.ru}</span>» будет скрыт в архив.
                                    Его можно будет восстановить в любой момент.
                                </>
                            )}
                        </p>
                    )
                }
            />
        </div>
    );
};

export default PostsPage;
