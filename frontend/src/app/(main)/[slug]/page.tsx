import { notFound } from 'next/navigation';
import ClientPdfViewer from '@/components/ClientPdfViewer';
import SocialShare from '@/components/SocialShare';
import { usePostViewStore } from '@/store/usePostViewStore';
import PostViewTracker from './PostViewTracker';
import { IPost } from '@/entities/models/post.types';
import ApplyButton from './ApplyButton';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Страница не кэшируется — данные конкурса запрашиваются заново на каждый заход
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPostBySlug(slug: string): Promise<IPost | null> {
    const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/posts/${slug}`, {
        cache: 'no-store',
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Не удалось загрузить конкурс');

    return res.json();
}

const fileUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_BACKEND || 'http://localhost:2000'}/${path.replace(/\\/g, '/')}`;

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) return { title: 'Конкурс табылган жок | Kitepkura' };

    return {
        title: `${post.name.ru} | Kitepkura`,
        description: post.description.ru,
    };
}

export default async function DetailPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) notFound();

    const title = post.name.ru;
    const subtitle = post.description.ru;
    const formUrl = post.urlForm;
    const badge = post.isArchive ? 'Архивделген' : 'Ачык';
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

                        {/* Счётчик просмотров */}
                        <p className='inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-text-muted sm:text-sm'>
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
                                <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                                <circle cx='12' cy='12' r='3' />
                            </svg>
                            Көрүү саны: {(post.viewsCount ?? 0).toLocaleString('ru-RU')}
                        </p>
                    </div>

                    <h1 className='text-2xl font-semibold leading-tight text-text sm:text-3xl lg:text-4xl'>{title}</h1>

                    <p className='mt-3 max-w-3xl text-base text-text-muted sm:mt-4 sm:text-lg'>{subtitle}</p>

                    {!post.isArchive && <ApplyButton slug={post.slug} formUrl={formUrl} initialClicks={post.urlClicks ?? 0} />}

                    {/* Дата */}
                    <div className='mt-6 flex justify-end border-t border-border pt-4'>
                        <div className='flex items-center gap-2 text-sm text-text-muted'>
                            <svg
                                width='16'
                                height='16'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            >
                                <rect x='3' y='4' width='18' height='18' rx='2' />
                                <line x1='16' y1='2' x2='16' y2='6' />
                                <line x1='8' y1='2' x2='8' y2='6' />
                                <line x1='3' y1='10' x2='21' y2='10' />
                            </svg>

                            <span>
                                Жарыяланды: <span className='font-medium text-text'>{formattedDate}</span>
                            </span>
                        </div>
                    </div>
                </section>

                {/* ===== PDF + маалымат ===== */}
                <section className='flex flex-col gap-6 sm:gap-8'>
                    {post.postFiles.length > 0 && (
                        <div className='rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-6'>
                            {post.postFiles.map((file, index) => (
                                <div key={file.id} className={index > 0 ? 'mt-10' : ''}>
                                    <div className='mb-3 flex items-center justify-between sm:mb-4'>
                                        <h2 className='text-lg font-semibold text-text sm:text-xl'>{file.original_name}</h2>
                                    </div>
                                    <ClientPdfViewer fileUrl={fileUrl(file.path)} fileName={file.original_name} />
                                </div>
                            ))}
                        </div>
                    )}

                    {!post.isArchive && (
                        <div className='rounded-2xl border border-border bg-neutral-900 p-6 text-white shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-8'>
                            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                                <div>
                                    <p className='text-xs uppercase tracking-[0.3em] text-slate-400 sm:text-sm'>Арыз берүү</p>

                                    <h2 className='mt-2 text-xl font-semibold sm:text-2xl'>Конкурска катышуу</h2>

                                    <p className='mt-3 text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base sm:leading-7'>
                                        Эгер бардык талаптар менен таанышып чыгып, катышууга даяр болсоңуз, төмөнкү баскычты басып арызыңызды жөнөтө
                                        аласыз.
                                    </p>
                                </div>

                                <a
                                    href={formUrl}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='inline-flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-7 py-5 text-lg font-bold text-white shadow-[0_12px_32px_rgba(0,0,0,0.28)] ring-2 ring-white/10 transition duration-200 hover:scale-[1.01] hover:from-primary-600 hover:to-primary-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.32)] sm:text-xl'
                                >
                                    Арыз берүү
                                </a>
                            </div>
                        </div>
                    )}

                    {post.isArchive && post.archive_description && (
                        <div className='rounded-2xl border border-border bg-neutral-100 p-6 text-text-muted shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-8'>
                            <p className='text-xs uppercase tracking-[0.3em] text-text-muted sm:text-sm'>Архив</p>
                            <p className='mt-3 text-sm leading-6 sm:text-base sm:leading-7'>{post.archive_description}</p>
                        </div>
                    )}
                </section>

                <SocialShare title={title} description={subtitle} />
            </main>
        </div>
    );
}
