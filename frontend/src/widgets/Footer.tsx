export default function Footer() {
    return (
        <footer className='border-t border-border bg-surface text-text'>
            <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-10'>
                {/* Логотип и Название */}
                <div className='flex items-center gap-4'>
                    <img src='/logo.png' alt='Окуу Китеби' className='h-14 w-14 rounded-full object-cover' />
                    <div>
                        <p className='text-base font-semibold'>Kitepkura</p>
                        <p className='text-sm text-text-muted'>Ачык сынактар  </p>
                    </div>
                </div>

                {/* Соцсети с иконками */}
                <div className='flex items-center gap-4'>
                    {/* Facebook */}
                    <a
                        href='https://www.facebook.com/Kitepkura.kg/?rdid=yi2vo1dBNcZ1ZEkf'
                        target='_blank'
                        rel='noreferrer'
                        className='text-brand transition-colors hover:text-brand-hover'
                        aria-label='Facebook'
                    >
                        <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                            <path
                                fillRule='evenodd'
                                d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <span className='sr-only'>Facebook</span>
                    </a>

                    {/* Instagram */}
                    <a
                        href='https://www.instagram.com/kitepkura_kg'
                        target='_blank'
                        rel='noreferrer'
                        className='text-brand transition-colors hover:text-brand-hover'
                        aria-label='Instagram'
                    >
                        <svg
                            className='h-6 w-6'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                        >
                            <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
                            <path d='M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z' />
                            <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' strokeWidth='3' />
                        </svg>
                        <span className='sr-only'>Instagram</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
