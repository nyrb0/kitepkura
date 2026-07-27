'use client';

import { forwardRef, useState, InputHTMLAttributes, ReactNode } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, isPassword = false, type = 'text', id, className = '', style, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        // Если это инпут пароля, управляем типом динамически
        const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className='w-full'>
                {label && (
                    <label htmlFor={id} className='mb-1.5 block text-sm font-medium text-[var(--color-text)]'>
                        {label}
                    </label>
                )}

                <div className='relative'>
                    {/* Левая иконка */}
                    {leftIcon && (
                        <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]'>{leftIcon}</div>
                    )}

                    {/* Сам инпут */}
                    <input
                        id={id}
                        ref={ref}
                        type={computedType}
                        className={`w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-200)] ${
                            leftIcon ? 'pl-10' : 'pl-4'
                        } ${isPassword ? 'pr-10' : 'pr-4'} ${className}`}
                        style={{
                            borderColor: error ? 'var(--color-danger-500)' : 'var(--color-border)',
                            ...style,
                        }}
                        {...props}
                    />

                    {/* Переключатель видимости пароля */}
                    {isPassword && (
                        <button
                            type='button'
                            onClick={() => setShowPassword(v => !v)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors'
                            tabIndex={-1}
                        >
                            {showPassword ? <FiEyeOff className='h-4.5 w-4.5' /> : <FiEye className='h-4.5 w-4.5' />}
                        </button>
                    )}
                </div>

                {/* Текст ошибки */}
                {error && <p className='mt-1.5 text-xs text-[var(--color-danger-600)]'>{error}</p>}
            </div>
        );
    },
);

Input.displayName = 'Input';
