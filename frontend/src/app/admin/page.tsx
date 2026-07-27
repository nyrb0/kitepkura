'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiEye, FiTrendingUp, FiCalendar, FiActivity, FiAward, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { visitsService } from '@/shared/services/visits.service';
import { postService } from '@/shared/services/post.service';
import { useRouter } from 'next/navigation';
import { routers } from '../router.const';

interface IVisitsStats {
    today: number;
    yesterday: number;
    last7Days: number;
    last30Days: number;
    total: number;
}

interface LocalizedString {
    ru: string;
    ky?: string;
    kg?: string;
}

interface ITopPost {
    id: string;
    slug: string;
    name: LocalizedString;
    description: LocalizedString;
    urlClicks: number;
    createdAt: string;
    viewsCount: number;
}

interface ITopViewedResponse {
    activeCount: number;
    topPosts: ITopPost[];
}

const cardVariants = {
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
    value = 0,
    index,
    accent,
}: {
    icon: typeof FiEye;
    label: string;
    value?: number;
    index: number;
    accent?: boolean;
}) => (
    <motion.div
        custom={index}
        initial='hidden'
        animate='visible'
        variants={cardVariants}
        className='rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5'
        style={{
            background: accent ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))' : 'var(--color-surface)',
            boxShadow: 'var(--shadow-card)',
        }}
    >
        <div className='flex items-center justify-between'>
            <span
                className='flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]'
                style={{
                    backgroundColor: accent ? 'rgba(255,255,255,0.15)' : 'var(--color-primary-50)',
                }}
            >
                <Icon className='h-4.5 w-4.5' style={{ color: accent ? '#ffffff' : 'var(--color-primary-600)' }} />
            </span>
        </div>
        <p className='mt-4 text-3xl font-bold tracking-tight' style={{ color: accent ? '#ffffff' : 'var(--color-text)' }}>
            {value.toLocaleString('ru-RU')}
        </p>
        <p className='mt-1 text-sm' style={{ color: accent ? 'rgba(255,255,255,0.75)' : 'var(--color-text-muted)' }}>
            {label}
        </p>
    </motion.div>
);

const DashboardPage = () => {
    const {
        data: stats,
        isPending: isStatsPending,
        isError: isStatsError,
    } = useQuery({
        queryKey: ['visits-stats'],
        queryFn: () => visitsService.stats() as Promise<IVisitsStats>,
        refetchInterval: 60_000,
    });

    const {
        data: topViewed,
        isPending: isTopPending,
        isError: isTopError,
    } = useQuery({
        queryKey: ['posts-top-viewed'],
        queryFn: () => postService.topViewed() as Promise<ITopViewedResponse>,
    });
    const router = useRouter();
    const chartData = stats
        ? [
              { label: 'Сегодня', value: stats.today },
              { label: 'Вчера', value: stats.yesterday },
              { label: '7 дней', value: stats.last7Days },
              { label: '30 дней', value: stats.last30Days },
          ]
        : [];

    const maxViews = topViewed?.topPosts.reduce((max, p) => Math.max(max, p.viewsCount), 0) ?? 0;

    return (
        <div className='min-h-screen w-full px-4 py-10 sm:py-16'>
            <div className='mx-auto w-full max-w-6xl'>
                {/* Заголовок */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className='mb-8 flex items-center gap-3'
                >
                    <div
                        className='flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)]'
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <FiActivity className='h-5 w-5 text-[var(--color-brand-foreground)]' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold tracking-tight text-[var(--color-text)]'>Дашборд</h1>
                        <p className='text-sm text-[var(--color-text-muted)]'>Статистика посещений и популярные посты</p>
                    </div>
                </motion.div>

                {isStatsError && (
                    <div
                        className='mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                        style={{
                            borderColor: 'var(--color-danger-500)',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--color-danger-600)',
                        }}
                    >
                        <FiAlertCircle className='h-4 w-4 shrink-0' />
                        Не удалось загрузить статистику посещений
                    </div>
                )}

                {/* Карточки статистики */}
                {isStatsPending ? (
                    <div className='flex items-center justify-center py-16'>
                        <FiLoader className='h-6 w-6 animate-spin text-[var(--color-primary-600)]' />
                    </div>
                ) : (
                    stats && (
                        <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
                            <StatCard icon={FiCalendar} label='Сегодня' value={stats.today} index={0} accent />
                            <StatCard icon={FiCalendar} label='Вчера' value={stats.yesterday} index={1} />
                            <StatCard icon={FiTrendingUp} label='За 7 дней' value={stats.last7Days} index={2} />
                            <StatCard icon={FiTrendingUp} label='За 30 дней' value={stats.last30Days} index={3} />
                            <StatCard icon={FiEye} label='Всего просмотров' value={stats.total} index={4} />
                        </div>
                    )
                )}

                <div className='grid gap-6 lg:grid-cols-5'>
                    {/* График */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-3'
                        style={{ boxShadow: 'var(--shadow-elevated)' }}
                    >
                        <h2 className='mb-4 text-base font-semibold text-[var(--color-text)]'>Динамика посещений</h2>

                        {chartData.length > 0 ? (
                            <ResponsiveContainer width='100%' height={280}>
                                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray='3 3' stroke='var(--color-neutral-200)' vertical={false} />
                                    <XAxis
                                        dataKey='label'
                                        tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                                        axisLine={{ stroke: 'var(--color-border)' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--color-primary-50)' }}
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: '1px solid var(--color-border)',
                                            fontSize: 13,
                                        }}
                                    />
                                    <Bar dataKey='value' radius={[8, 8, 0, 0]} fill='var(--color-primary-600)' maxBarSize={56} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='flex h-[280px] items-center justify-center text-sm text-[var(--color-text-muted)]'>Нет данных</div>
                        )}
                    </motion.div>

                    {/* Топ постов */}

                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-2'
                        style={{ boxShadow: 'var(--shadow-elevated)' }}
                    >
                        <div className='mb-4 flex items-center justify-between'>
                            <h2 className='flex items-center gap-2 text-base font-semibold text-[var(--color-text)]'>
                                <FiAward className='h-4 w-4' style={{ color: 'var(--color-primary-600)' }} />
                                Топ постов
                            </h2>
                            {topViewed && <span className='text-xs text-[var(--color-text-muted)]'>{topViewed.activeCount} активных</span>}
                        </div>

                        {isTopError && (
                            <p className='flex items-center gap-2 text-sm text-[var(--color-danger-600)]'>
                                <FiAlertCircle className='h-4 w-4 shrink-0' />
                                Не удалось загрузить топ постов
                            </p>
                        )}

                        {isTopPending ? (
                            <div className='flex items-center justify-center py-10'>
                                <FiLoader className='h-5 w-5 animate-spin text-[var(--color-primary-600)]' />
                            </div>
                        ) : (
                            <ul className='space-y-3'>
                                {topViewed?.topPosts.map((post, index) => (
                                    <motion.li
                                        key={post.id}
                                        onClick={() => router.push(routers.post.viewSlug(post.slug))}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ delay: 0.25 + index * 0.06, duration: 0.3 }}
                                        className='group cursor-pointer rounded-[var(--radius-md)] border p-3 transition-colors duration-200 hover:border-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]/30'
                                        style={{ borderColor: 'var(--color-border)' }}
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='flex min-w-0 items-start gap-3'>
                                                <span
                                                    className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200'
                                                    style={{
                                                        backgroundColor: index === 0 ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
                                                        color: index === 0 ? '#ffffff' : 'var(--color-text-muted)',
                                                    }}
                                                >
                                                    {index + 1}
                                                </span>
                                                <div className='min-w-0'>
                                                    {/* При ховере заголовка подсвечиваем его цветом бренда через group-hover */}
                                                    <p className='truncate text-sm font-medium text-[var(--color-text)] transition-colors duration-200 group-hover:text-[var(--color-primary-600)]'>
                                                        {post.name.ru}
                                                    </p>
                                                    <p className='truncate text-xs text-[var(--color-text-muted)]'>{post.description.ru}</p>
                                                </div>
                                            </div>
                                            <span className='flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-primary-600)]'>
                                                <FiEye className='h-3.5 w-3.5' />
                                                {post.viewsCount}
                                            </span>
                                        </div>

                                        {/* Мини progress-bar */}
                                        <div
                                            className='mt-2 h-1.5 w-full overflow-hidden rounded-full'
                                            style={{ backgroundColor: 'var(--color-neutral-100)' }}
                                        >
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${maxViews > 0 ? (post.viewsCount / maxViews) * 100 : 0}%` }}
                                                transition={{ delay: 0.3 + index * 0.06, duration: 0.5, ease: 'easeOut' }}
                                                className='h-full rounded-full'
                                                style={{ backgroundColor: 'var(--color-primary-600)' }}
                                            />
                                        </div>
                                    </motion.li>
                                ))}

                                {topViewed?.topPosts.length === 0 && (
                                    <p className='py-6 text-center text-sm text-[var(--color-text-muted)]'>Пока нет данных о просмотрах</p>
                                )}
                            </ul>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
