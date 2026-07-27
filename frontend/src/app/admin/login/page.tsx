'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Input } from '@/shared/UI/Input';
import { Button } from '@/shared/UI/Button';
import { axiosService } from '@/shared/http/http';
import { authService } from '@/shared/services/auth.service';
type LoginFormValues = {
    email: string;
    password: string;
};

const LoginAdmin = () => {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError(null);
        setIsLoading(true);

        try {
            const res = await authService.login(data);
            const result = res.data;
            console.log(result);
            if (result?.accessToken) {
                localStorage.setItem('accessToken', result.accessToken);
            }
            router.push('/admin');
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-[var(--color-background)] relative overflow-hidden px-4'>
            <div className='relative w-full max-w-md'>
                {/* Карточка */}
                <div
                    className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-10'
                    style={{ boxShadow: 'var(--shadow-elevated)' }}
                >
                    {/* Иконка бренда */}
                    <div className='flex flex-col items-center mb-8'>
                        <div
                            className='flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] mb-4'
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
                                boxShadow: 'var(--shadow-card)',
                            }}
                        >
                            <FiShield className='h-7 w-7 text-[var(--color-brand-foreground)]' />
                        </div>
                        <h1 className='text-2xl font-bold text-[var(--color-text)] tracking-tight'>Панель администратора</h1>
                        <p className='text-sm text-[var(--color-text-muted)] mt-1 text-center'>Введите свои учётные данные, чтобы продолжить</p>
                    </div>

                    {serverError && (
                        <div
                            className='mb-6 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                            style={{
                                borderColor: 'var(--color-danger-500)',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                color: 'var(--color-danger-600)',
                            }}
                        >
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-5'>
                        {/* Email */}
                        <Input
                            id='email'
                            type='email'
                            label='Email'
                            autoComplete='email'
                            placeholder='admin@example.com'
                            leftIcon={<FiMail className='h-4.5 w-4.5' />}
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Введите email',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Некорректный email',
                                },
                            })}
                        />

                        {/* Password */}
                        <Input
                            id='password'
                            label='Пароль'
                            isPassword
                            autoComplete='current-password'
                            placeholder='••••••••'
                            leftIcon={<FiLock className='h-4.5 w-4.5' />}
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Введите пароль',
                                minLength: {
                                    value: 6,
                                    message: 'Минимум 6 символов',
                                },
                            })}
                        />
                        <Button type='submit' isLoading={isLoading} className='mt-2'>
                            Войти
                        </Button>
                    </form>
                </div>

                <p className='mt-6 text-center text-xs text-[var(--color-text-muted)]'>Доступ только для авторизованных администраторов</p>
            </div>
        </div>
    );
};

export default LoginAdmin;
