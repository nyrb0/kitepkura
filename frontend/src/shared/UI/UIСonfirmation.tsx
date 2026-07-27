import { useEffect } from 'react';
import { FiTrash2, FiX, FiLoader } from 'react-icons/fi';

interface IUIConfirmationProps {
    isOpen: boolean;
    onOk: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    title?: string;
    description?: React.ReactNode;
}

export const UIConfirmation = ({ isOpen, onOk, onCancel, isLoading = false, title = 'Удалить пост?', description }: IUIConfirmationProps) => {
    // Закрытие по клавише Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onCancel();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm transition-opacity'
            onClick={e => {
                if (e.target === e.currentTarget && !isLoading) onCancel();
            }}
        >
            <div
                className='w-full max-w-sm rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-6 shadow-2xl transition-all'
                style={{ boxShadow: 'var(--shadow-elevated)' }}
            >
                <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                        <div
                            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]'
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                            <FiTrash2 className='h-5 w-5' style={{ color: 'var(--color-danger-600)' }} />
                        </div>
                        <h3 className='text-base font-semibold text-[var(--color-text)]'>{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className='rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-50 transition-colors'
                        aria-label='Закрыть'
                    >
                        <FiX className='h-5 w-5' />
                    </button>
                </div>

                {description && <div className='mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed'>{description}</div>}

                <div className='mt-6 flex gap-3'>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className='flex-1 rounded-[var(--radius-md)] border py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-neutral-100)] disabled:opacity-50'
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={onOk}
                        disabled={isLoading}
                        className='flex items-center justify-center gap-2 flex-1 rounded-[var(--radius-md)] py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 hover:opacity-90'
                        style={{ backgroundColor: 'var(--color-danger-600)' }}
                    >
                        {isLoading ? (
                            <>
                                <FiLoader className='h-4 w-4 animate-spin' />
                                <span>Удаление...</span>
                            </>
                        ) : (
                            'Удалить'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UIConfirmation;
