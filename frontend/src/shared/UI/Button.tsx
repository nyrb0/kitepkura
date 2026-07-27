'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { FiLoader } from 'react-icons/fi';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ isLoading = false, variant = 'primary', fullWidth = true, children, className = '', disabled, style, ...props }, ref) => {
        // Базовые стили по умолчанию для вариантов
        const variantStyles = {
            primary: {
                background: isLoading ? 'var(--color-primary-400)' : 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                color: 'var(--color-brand-foreground)',
                boxShadow: 'var(--shadow-card)',
            },
            outline: {
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
            },
            ghost: {
                background: 'transparent',
                color: 'var(--color-text)',
            },
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`relative inline-flex items-center justify-center rounded-[var(--radius-md)] py-2.5 px-4 text-sm font-semibold transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                    fullWidth ? 'w-full' : ''
                } ${className}`}
                style={{
                    ...variantStyles[variant],
                    ...style,
                }}
                {...props}
            >
                {isLoading ? (
                    <div className='flex items-center justify-center gap-2'>
                        <FiLoader className='h-4.5 w-4.5 animate-spin' />
                        <span>Вход...</span>
                    </div>
                ) : (
                    children
                )}
            </button>
        );
    },
);

Button.displayName = 'Button';
