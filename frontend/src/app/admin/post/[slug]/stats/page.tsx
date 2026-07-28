'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    FiArrowLeft,
    FiEye,
    FiCalendar,
    FiTrendingUp,
    FiFile,
    FiExternalLink,
    FiLoader,
    FiAlertCircle,
    FiArchive,
    FiMousePointer,
} from 'react-icons/fi';
import { postService } from '@/shared/services/post.service';

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
    archive_description: string | null;
    createdAt: string;
    updatedAt: string;
    postFiles: PostFile[];
}

interface ViewStats {
    today: number;
    yesterday: number;
    last7Days: number;
    last30Days: number;
    total: number;
}

interface PostStatsResponse {
    post: Post;
    stats: ViewStats;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
    }),
};

const StatCard = ({
    icon: Icon,
    label,
    value,
    index,
    accent,
}: {
    icon: typeof FiEye;
    label: string;
    value: number;
    index: number;
    accent?: boolean;
}) => (
    <motion.div
        custom={index}
        initial='hidden'
        animate='visible'
        variants={fadeUp}
        className='rounded-[var(--radius-xl)] border border-[var(--color-border)] p-4 sm:p-5'
        style={{
            background: accent ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))' : 'var(--color-surface)',
            boxShadow: 'var(--shadow-card)',
        }}
    >
        <span
            className='flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] sm:h-9 sm:w-9'
            style={{ backgroundColor: accent ? 'rgba(255,255,255,0.15)' : 'var(--color-primary-50)' }}
        >
            <Icon className='h-4 w-4 sm:h-4.5 sm:w-4.5' style={{ color: accent ? '#ffffff' : 'var(--color-primary-600)' }} />
        </span>
        <p className='mt-3 text-2xl font-bold tracking-tight sm:mt-4 sm:text-3xl' style={{ color: accent ? '#ffffff' : 'var(--color-text)' }}>
            {value.toLocaleString('ru-RU')}
        </p>
        <p className='mt-1 text-xs sm:text-sm' style={{ color: accent ? 'rgba(255,255,255,0.75)' : 'var(--color-text-muted)' }}>
            {label}
        </p>
    </motion.div>
);

const PostStatsPage = () => {
    const router = useRouter();
    const { slug } = useParams<{ slug: string }>();

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['post-stats', slug],
        queryFn: () => postService.getStats(slug) as Promise<PostStatsResponse>,
        enabled: Boolean(slug),
    });

    const post = data?.post;
    const stats = data?.stats;

    const chartData = stats
        ? [
              { label: 'Сегодня', value: stats.today },
              { label: 'Вчера', value: stats.yesterday },
              { label: '7 дней', value: stats.last7Days },
              { label: '30 дней', value: stats.last30Days },
          ]
        : [];

    if (isPending) {
        return (
            <div className='flex min-h-screen w-full items-center justify-center'>
                <FiLoader className='h-6 w-6 animate-spin text-[var(--color-primary-600)]' />
            </div>
        );
    }

    if (isError || !post || !stats) {
        return (
            <div className='flex min-h-screen w-full items-center justify-center px-4'>
                <div
                    className='flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                    style={{
                        borderColor: 'var(--color-danger-500)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: 'var(--color-danger-600)',
                    }}
                >
                    <FiAlertCircle className='h-4 w-4 shrink-0' />
                    {error instanceof Error ? error.message : 'Не удалось загрузить статистику поста'}
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen w-full px-4 py-8 sm:py-12 lg:py-16'>
            <div className='mx-auto w-full max-w-5xl'>
                {/* Назад */}
                <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => router.back()}
                    className='mb-6 flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]'
                >
                    <FiArrowLeft className='h-4 w-4' />
                    Назад к постам
                </motion.button>

                {/* Карточка поста */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className='mb-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:mb-8 sm:p-8'
                    style={{ boxShadow: 'var(--shadow-elevated)' }}
                >
                    <div className='flex flex-wrap items-center gap-2'>
                        <span
                            className='inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium sm:text-sm'
                            style={{
                                backgroundColor: post.isArchive ? 'var(--color-neutral-100)' : 'var(--color-primary-50)',
                                color: post.isArchive ? 'var(--color-text-muted)' : 'var(--color-primary-700)',
                            }}
                        >
                            {post.isArchive && <FiArchive className='h-3.5 w-3.5' />}
                            {post.isArchive ? 'В архиве' : 'Активен'}
                        </span>
                        <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--color-neutral-100)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)] sm:text-sm'>
                            <FiCalendar className='h-3.5 w-3.5' />
                            {formatDate(post.createdAt)}
                        </span>
                    </div>

                    <h1 className='mt-4 text-xl font-bold leading-snug text-[var(--color-text)] sm:text-2xl lg:text-3xl'>{post.name.ru}</h1>
                    <p className='mt-2 text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base'>{post.description.ru}</p>

                    <div className='mt-5 flex flex-wrap items-center gap-3'>
                        <a
                            href={post.urlForm}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-foreground)] transition-opacity hover:opacity-90'
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                                boxShadow: 'var(--shadow-card)',
                            }}
                        >
                            <FiExternalLink className='h-4 w-4' />
                            Открыть форму
                        </a>

                        {post.postFiles.map(file => (
                            <a
                                key={file.id}
                                href={`${process.env.NEXT_PUBLIC_API_URL ?? ''}/${file.path.replace(/\\/g, '/')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-neutral-100)] sm:text-sm'
                                style={{ borderColor: 'var(--color-border)' }}
                            >
                                <FiFile className='h-3.5 w-3.5 shrink-0' style={{ color: 'var(--color-primary-600)' }} />
                                <span className='max-w-[140px] truncate sm:max-w-[220px]'>{file.original_name}</span>
                                <span className='shrink-0 text-[var(--color-text-muted)]'>{formatBytes(file.size)}</span>
                            </a>
                        ))}
                    </div>
                </motion.div>

                {/* Карточки статистики */}
                <div className='mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6'>
                    <StatCard icon={FiCalendar} label='Сегодня' value={stats.today} index={0} accent />
                    <StatCard icon={FiCalendar} label='Вчера' value={stats.yesterday} index={1} />
                    <StatCard icon={FiTrendingUp} label='За 7 дней' value={stats.last7Days} index={2} />
                    <StatCard icon={FiTrendingUp} label='За 30 дней' value={stats.last30Days} index={3} />
                    <StatCard icon={FiEye} label='Всего просмотров' value={stats.total} index={4} />
                    <StatCard icon={FiMousePointer} label='Кликов по ссылке' value={post.urlClicks} index={5} />
                </div>

                {/* График */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6'
                    style={{ boxShadow: 'var(--shadow-elevated)' }}
                >
                    <h2 className='mb-4 text-sm font-semibold text-[var(--color-text)] sm:text-base'>Динамика просмотров</h2>

                    <ResponsiveContainer width='100%' height={260}>
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray='3 3' stroke='var(--color-neutral-200)' vertical={false} />
                            <XAxis
                                dataKey='label'
                                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                                axisLine={{ stroke: 'var(--color-border)' }}
                                tickLine={false}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'var(--color-primary-50)' }}
                                contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13 }}
                            />
                            <Bar dataKey='value' radius={[8, 8, 0, 0]} fill='var(--color-primary-600)' maxBarSize={56} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default PostStatsPage;
