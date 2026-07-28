'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiFileText, FiPlusCircle, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { removeFromStorage } from '@/shared/cookie/token.service';

type DockItem = {
    icon: IconType;
    label: string;
    href: string;
    isDanger?: boolean;
};

const mainItems: DockItem[] = [
    { icon: FiHome, label: 'Главная', href: '/admin' },
    { icon: FiFileText, label: 'Посты', href: '/admin/post' },
];

const logoutItem: DockItem = {
    icon: FiLogOut,
    label: 'Выйти',
    href: '/',
    isDanger: true,
};

const DockIcon = ({ item }: { item: DockItem }) => {
    const router = useRouter();
    const pathname = usePathname();

    // Проверка активности: точное совпадение для /admin, либо совпадение по перфиксу для вложенных роутов
    const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

    const Icon = item.icon;

    const handleClick = () => {
        if (item.isDanger) {
            removeFromStorage();
            router.push(item.href);
            return;
        }
        router.push(item.href);
    };

    return (
        <button
            onClick={handleClick}
            className='group relative flex flex-col items-center justify-center outline-none select-none transition-transform duration-200 hover:-translate-y-1 active:translate-y-0.5'
            aria-label={item.label}
        >
            {/* Tooltip */}
            <span className='pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-neutral-200 bg-neutral-900/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-elevated opacity-0 backdrop-blur-md transition-all duration-150 group-hover:opacity-100 z-30'>
                {item.label}
            </span>

            {/* Иконка в стеклянном контейнере */}
            <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                    item.isDanger
                        ? 'bg-danger-500/10 text-danger-600 hover:bg-danger-500 hover:text-white border border-danger-500/20 shadow-sm'
                        : isActive
                          ? 'bg-brand text-brand-foreground border border-brand/40 shadow-elevated scale-105'
                          : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900 border border-neutral-200/60'
                }`}
            >
                {/* Блик для объёма */}
                <span className='absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none' />

                <Icon className='h-5 w-5 shrink-0 relative z-10' />
            </span>

            {/* Индикатор активного экрана (Точка) */}
            {isActive && <span className='absolute -bottom-2 h-1 w-1 rounded-full bg-brand shadow-[0_0_8px_var(--color-brand)]' />}
        </button>
    );
};

const DockNav = () => {
    const pathname = usePathname();
    if (pathname === '/admin/login') {
        return null;
    }
    return (
        <nav className='fixed bottom-2 left-1/2 z-50 -translate-x-1/2'>
            <div
                className='flex items-center gap-2 rounded-2xl border border-neutral-200/80 bg-surface/70 p-2 backdrop-blur-xl shadow-elevated ring-1 ring-black/5'
                style={{
                    backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                }}
            >
                {mainItems.map(item => (
                    <DockIcon key={item.href} item={item} />
                ))}

                {/* Вертикальный разделитель */}
                <div className='mx-1 h-6 w-[1px] bg-neutral-200 rounded-full' />

                <DockIcon item={logoutItem} />
            </div>
        </nav>
    );
};

export default DockNav;
