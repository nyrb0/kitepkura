import Link from 'next/link';
import { FiHome, FiSearch } from 'react-icons/fi';

export const metadata = {
    title: 'Барак табылган жок | Kitepkura',
};

export default function NotFound() {
    return (
        <div className='flex min-h-screen w-full items-center justify-center bg-[var(--color-background)] px-4'>
            <div className='w-full max-w-lg text-center'>
                {/* Иллюстративный номер ошибки */}
                <div className='relative mx-auto mb-6 flex h-28 w-28 items-center justify-center'>
                    <div className='absolute inset-0 rounded-full opacity-40 blur-2xl' style={{ backgroundColor: 'var(--color-primary-300)' }} />
                    <div
                        className='relative flex h-24 w-24 items-center justify-center rounded-[var(--radius-xl)]'
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
                            boxShadow: 'var(--shadow-elevated)',
                        }}
                    >
                        <FiSearch className='h-9 w-9 text-[var(--color-brand-foreground)]' />
                    </div>
                </div>

                <p
                    className='text-6xl font-extrabold tracking-tight sm:text-7xl'
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    404
                </p>

                <h1 className='mt-3 text-xl font-bold text-[var(--color-text)] sm:text-2xl'>Барак табылган жок</h1>
                <p className='mt-2 text-sm text-[var(--color-text-muted)] sm:text-base'>
                    Балким, шилтеме туура эмес же барак жылдырылган же өчүрүлгөн.
                </p>

                <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
                    <Link
                        href='/'
                        className='flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold text-[var(--color-brand-foreground)] transition-all hover:opacity-90 sm:w-auto'
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                            boxShadow: 'var(--shadow-card)',
                        }}
                    >
                        <FiHome className='h-4 w-4' />
                        Башкы бетке кайтуу
                    </Link>
                </div>
            </div>
        </div>
    );
}
