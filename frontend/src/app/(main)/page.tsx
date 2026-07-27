import Link from 'next/link';

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

interface PostsResponse {
    data: Post[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Страница не должна кэшироваться и не должна пререндериться статически —
// данные всегда должны быть свежими на каждый запрос.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPosts(): Promise<Post[]> {
    const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/posts?page=1&limit=30&isArchive=false`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Не удалось загрузить список сынактар');
    }

    const json: PostsResponse = await res.json();
    return json.data;
}

function formatDate(isoString: string) {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month} ${hours}:${minutes}`;
}

export default async function Home() {
    const posts = await getPosts();

    return (
        <main className='min-h-screen bg-background text-text'>
            <section className='mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
                <div className='rounded-2xl border border-border/80 bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-300 sm:p-8 md:p-10'>
                    {/* Надзаголовок */}
                    <p className='text-xs font-bold uppercase tracking-[0.15em] text-primary-600 sm:text-sm'>Kitepkura</p>

                    {/* Главный заголовок */}
                    <h1 className='mt-3 text-2xl font-bold leading-snug text-text sm:mt-4 sm:text-3xl md:text-4xl md:leading-tight'>
                        Сынактарды карап, катышуу үчүн тандаңыз
                    </h1>
                </div>

                {posts.length === 0 ? (
                    <div className='rounded-2xl border border-dashed border-border p-10 text-center text-slate-600'>Азырынча сынактар жок</div>
                ) : (
                    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                        {posts.map(post => (
                            <Link
                                key={post.id}
                                href={`/${post.slug}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-elevated'
                            >
                                {/* Верхняя часть карточки */}
                                <div>
                                    {/* Дата и время (например: 23.07 14:30) */}
                                    <div className='flex items-center gap-1.5 text-xs text-slate-500'>
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
                                            <rect x='3' y='4' width='18' height='18' rx='2' />
                                            <line x1='16' y1='2' x2='16' y2='6' />
                                            <line x1='8' y1='2' x2='8' y2='6' />
                                            <line x1='3' y1='10' x2='21' y2='10' />
                                        </svg>
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>

                                    {/* Заголовок */}
                                    <h2 className='mt-3 text-xl font-bold leading-snug text-text transition-colors group-hover:text-brand'>
                                        {post.name.ru}
                                    </h2>

                                    {/* Описание */}
                                    <p className='mt-3 text-sm leading-relaxed text-slate-600 sm:text-base'>{post.description.ru}</p>

                                    {post.postFiles.length > 0 && (
                                        <p className='mt-3 text-xs font-medium text-slate-500'>{post.postFiles.length} файл тиркелген</p>
                                    )}
                                </div>

                                {/* Кнопка "Көрүү" */}
                                <div className='mt-6'>
                                    <div className='flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all duration-200 group-hover:bg-brand group-hover:text-brand-foreground'>
                                        <svg
                                            width='18'
                                            height='18'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='transition-transform group-hover:scale-110'
                                        >
                                            <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                                            <circle cx='12' cy='12' r='3' />
                                        </svg>
                                        <span>Кенен маалымат / Арыз берүү</span>
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
