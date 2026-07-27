'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    FiUploadCloud,
    FiFile,
    FiX,
    FiCheckCircle,
    FiFileText,
    FiType,
    FiAlertCircle,
    FiLink,
    FiArchive,
    FiTrash2,
    FiExternalLink,
} from 'react-icons/fi';
import { postService } from '@/shared/services/post.service';
import { routers } from '@/app/router.const';
import { Input } from '@/shared/UI/Input';
import { Button } from '@/shared/UI/Button';

type Locale = 'ru' | 'kg';

type UpdatePostFormValues = {
    name: Record<Locale, string>;
    description: Record<Locale, string>;
    urlForm: string;
    isArchive: boolean;
    archive_description?: string;
};

// Тип для существующего файла с бэкенда (подстройте под вашу модель PostFile)
type ExistingPostFile = {
    id: string;
    url?: string;
    name?: string;
    originalName?: string;
    size?: number;
};

const MAX_FILES = 10;
const ACCEPTED_TYPE = 'application/pdf';

const LOCALES: { key: Locale; label: string }[] = [
    { key: 'ru', label: 'Русский' },
    { key: 'kg', label: 'Кыргызча' },
];

const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Б';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const isPdf = (file: File) => file.type === ACCEPTED_TYPE || file.name.toLowerCase().endsWith('.pdf');

const EditPostPage = () => {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<ExistingPostFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState<Locale>('ru');

    // 1. Получение данных поста
    const {
        data: post,
        isLoading: isPostLoading,
        isError: isPostError,
    } = useQuery({
        queryKey: ['post', slug],
        queryFn: async () => {
            const response = await postService.findBySlug(slug);
            return response.data;
        },
        enabled: !!slug,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<UpdatePostFormValues>({
        mode: 'onBlur',
        defaultValues: {
            name: { ru: '', kg: '' },
            description: { ru: '', kg: '' },
            urlForm: '',
            isArchive: false,
            archive_description: '',
        },
    });

    // Отслеживаем состояние isArchive в реальном времени для показа/скрытия поля
    const isArchive = useWatch({ control, name: 'isArchive' });

    // 2. Заполнение формы при загрузке данных
    useEffect(() => {
        if (post) {
            reset({
                name: {
                    ru: post.name?.ru || '',
                    kg: post.name?.kg || '',
                },
                description: {
                    ru: post.description?.ru || '',
                    kg: post.description?.kg || '',
                },
                urlForm: post.urlForm || '',
                isArchive: !!post.isArchive,
                archive_description: post.archive_description || '',
            });

            if (post.postFiles && Array.isArray(post.postFiles)) {
                setExistingFiles(post.postFiles);
            }
        }
    }, [post, reset]);

    // 3. Мутация обновления
    const updatePostMutation = useMutation({
        mutationFn: (formData: FormData) => postService.update(slug, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', slug] });
            router.push(routers.admin.posts);
        },
    });

    const addFiles = useCallback(
        (incoming: FileList | File[]) => {
            const incomingArr = Array.from(incoming);
            const pdfFiles = incomingArr.filter(isPdf);
            const rejectedCount = incomingArr.length - pdfFiles.length;

            setFileError(rejectedCount > 0 ? 'Можно загружать только PDF-файлы' : null);

            if (pdfFiles.length === 0) return;

            setNewFiles(prev => {
                const totalCurrent = existingFiles.length + prev.length;
                const allowedCount = Math.max(0, MAX_FILES - totalCurrent);
                const merged = [...prev, ...pdfFiles.slice(0, allowedCount)];
                return merged;
            });
        },
        [existingFiles.length],
    );

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingFile = (id: string) => {
        // Здесь можно либо сразу вызывать API удаления файла, либо фильтровать локальный стейт
        setExistingFiles(prev => prev.filter(f => f.id !== id));
    };

    const onSubmit = (data: UpdatePostFormValues) => {
        const formData = new FormData();

        formData.append('name[ru]', data.name.ru);
        formData.append('name[kg]', data.name.kg);

        formData.append('description[ru]', data.description.ru);
        formData.append('description[kg]', data.description.kg);

        formData.append('urlForm', data.urlForm);
        formData.append('isArchive', String(data.isArchive));

        // Отправляем archive_description только если включен архив
        if (data.isArchive && data.archive_description) {
            formData.append('archive_description', data.archive_description);
        } else if (!data.isArchive) {
            formData.append('archive_description', ''); // Очищаем, если сняли архив
        }

        // Если бэкенд требует передачи оставшихся существующих файлов — добавьте их ID
        // formData.append('existingFiles', JSON.stringify(existingFiles.map(f => f.id)));

        newFiles.forEach(file => formData.append('files', file));

        updatePostMutation.mutate(formData);
    };

    if (isPostLoading) {
        return (
            <div className='flex min-h-screen w-full items-center justify-center px-4 py-10'>
                <div className='flex items-center gap-3 text-[var(--color-text-muted)]'>
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary-600)] border-t-transparent' />
                    <span>Загрузка данных поста...</span>
                </div>
            </div>
        );
    }

    if (isPostError || !post) {
        return (
            <div className='min-h-screen w-full px-4 py-10 sm:py-16'>
                <div className='mx-auto w-full max-w-4xl rounded-[var(--radius-xl)] border border-[var(--color-danger-500)] bg-[var(--color-surface)] p-8 text-center'>
                    <FiAlertCircle className='mx-auto mb-3 h-10 w-10 text-[var(--color-danger-600)]' />
                    <h2 className='mb-2 text-lg font-bold text-[var(--color-text)]'>Не удалось загрузить пост</h2>
                    <p className='mb-6 text-sm text-[var(--color-text-muted)]'>Возможно, пост был удален или произошла ошибка сети.</p>
                    <Button variant='outline' onClick={() => router.back()}>
                        Вернуться назад
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen w-full px-4 py-10 sm:py-16'>
            <div className='mx-auto w-full max-w-4xl'>
                {/* Заголовок */}
                <div className='mb-8'>
                    <div className='mb-2 flex items-center gap-3'>
                        <div
                            className='flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)]'
                            style={{
                                background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-900))',
                                boxShadow: 'var(--shadow-card)',
                            }}
                        >
                            <FiFileText className='h-5 w-5 text-[var(--color-brand-foreground)]' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-bold tracking-tight text-[var(--color-text)]'>Редактирование поста</h1>
                            <p className='text-xs text-[var(--color-text-muted)]'>ID: {post.id}</p>
                        </div>
                    </div>
                    <p className='text-sm text-[var(--color-text-muted)]'>Отредактируйте информацию и управляйте прикрепленными файлами</p>
                </div>

                {/* Карточка */}
                <div
                    className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8'
                    style={{ boxShadow: 'var(--shadow-elevated)' }}
                >
                    {updatePostMutation.isError && (
                        <div
                            className='mb-6 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                            style={{
                                borderColor: 'var(--color-danger-500)',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                color: 'var(--color-danger-600)',
                            }}
                        >
                            {updatePostMutation.error instanceof Error ? updatePostMutation.error.message : 'Произошла ошибка при обновлении поста'}
                        </div>
                    )}

                    {updatePostMutation.isSuccess && (
                        <div
                            className='mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                            style={{
                                borderColor: 'var(--color-success-500)',
                                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                color: 'var(--color-success-600)',
                            }}
                        >
                            <FiCheckCircle className='h-4 w-4 shrink-0' />
                            Пост успешно обновлен
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
                        {/* Блок переключения Архива */}
                        <div className='rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-neutral-50)] p-4 transition-colors'>
                            <label className='flex cursor-pointer items-center justify-between gap-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm'>
                                        <FiArchive className='h-4.5 w-4.5 text-[var(--color-primary-600)]' />
                                    </div>
                                    <div>
                                        <span className='block text-sm font-semibold text-[var(--color-text)]'>Архивный пост</span>
                                        <span className='block text-xs text-[var(--color-text-muted)]'>
                                            {isArchive
                                                ? 'Пост находится в архиве. Заполните причину или описание ниже.'
                                                : 'Переведите в архив, если пост больше не актуален'}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type='checkbox'
                                    className='h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] cursor-pointer'
                                    {...register('isArchive')}
                                />
                            </label>

                            {/* Поле archive_description появляется только при isArchive === true */}
                            {isArchive && (
                                <div className='mt-4 pt-4 border-t border-[var(--color-border)] animate-fadeIn'>
                                    <label htmlFor='archive_description' className='mb-1.5 block text-sm font-medium text-[var(--color-text)]'>
                                        Описание архивации / Причина{' '}
                                        <span className='text-xs font-normal text-[var(--color-text-muted)]'>(необязательно)</span>
                                    </label>
                                    <textarea
                                        id='archive_description'
                                        rows={3}
                                        placeholder='Укажите причину переноса в архив или заметку для пользователей...'
                                        className='w-full resize-none rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-200)] border-[var(--color-border)]'
                                        {...register('archive_description')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Табы языков */}
                        <div
                            className='flex items-center gap-1 rounded-[var(--radius-md)] p-1'
                            style={{ backgroundColor: 'var(--color-neutral-100)' }}
                        >
                            {LOCALES.map(locale => (
                                <button
                                    key={locale.key}
                                    type='button'
                                    onClick={() => setActiveLocale(locale.key)}
                                    className='relative flex-1 rounded-[var(--radius-sm)] py-2 text-sm font-medium transition-colors cursor-pointer'
                                    style={
                                        activeLocale === locale.key
                                            ? {
                                                  backgroundColor: 'var(--color-surface)',
                                                  color: 'var(--color-text)',
                                                  boxShadow: 'var(--shadow-card)',
                                              }
                                            : { color: 'var(--color-text-muted)' }
                                    }
                                >
                                    {locale.label}
                                    {(locale.key === 'ru'
                                        ? errors.name?.ru || errors.description?.ru
                                        : errors.name?.kg || errors.description?.kg) && (
                                        <span
                                            className='ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle'
                                            style={{ backgroundColor: 'var(--color-danger-500)' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Поля для каждого языка */}
                        {LOCALES.map(locale => (
                            <div key={locale.key} className={locale.key === activeLocale ? 'space-y-6' : 'hidden'}>
                                <Input
                                    label={`Название (${locale.label})`}
                                    placeholder='Введите название поста'
                                    leftIcon={<FiType className='h-4.5 w-4.5' />}
                                    error={errors.name?.[locale.key]?.message}
                                    {...register(`name.${locale.key}`, {
                                        required: 'Введите название',
                                    })}
                                />

                                <div>
                                    <label
                                        htmlFor={`description.${locale.key}`}
                                        className='mb-1.5 block text-sm font-medium text-[var(--color-text)]'
                                    >
                                        Описание ({locale.label})
                                    </label>
                                    <textarea
                                        id={`description.${locale.key}`}
                                        rows={5}
                                        placeholder='Расскажите подробнее о посте...'
                                        className='w-full resize-none rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-200)]'
                                        style={{
                                            borderColor: errors.description?.[locale.key] ? 'var(--color-danger-500)' : 'var(--color-border)',
                                        }}
                                        {...register(`description.${locale.key}`, {
                                            required: 'Введите описание',
                                        })}
                                    />
                                    {errors.description?.[locale.key] && (
                                        <p className='mt-1.5 text-xs text-[var(--color-danger-600)]'>{errors.description[locale.key]?.message}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        <Input
                            label='Ссылка на форму'
                            placeholder='https://forms.example.com/...'
                            leftIcon={<FiLink className='h-4.5 w-4.5' />}
                            error={errors.urlForm?.message}
                            {...register('urlForm', {
                                required: 'Введите ссылку на форму',
                                pattern: {
                                    value: /^https?:\/\/.+/i,
                                    message: 'Ссылка должна начинаться с http:// или https://',
                                },
                            })}
                        />

                        {/* Загрузка и управление файлами */}
                        <div>
                            <label className='mb-1.5 block text-sm font-medium text-[var(--color-text)]'>
                                PDF-файлы <span className='font-normal text-[var(--color-text-muted)]'>(всего до {MAX_FILES})</span>
                            </label>

                            {/* Список уже существующих файлов на сервере */}
                            {existingFiles.length > 0 && (
                                <div className='mb-4 space-y-2'>
                                    <p className='text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]'>
                                        Загруженные файлы ({existingFiles.length})
                                    </p>
                                    <ul className='space-y-2'>
                                        {existingFiles.map(file => (
                                            <li
                                                key={file.id}
                                                className='flex items-center justify-between rounded-[var(--radius-md)] border bg-[var(--color-neutral-50)] px-3 py-2'
                                                style={{ borderColor: 'var(--color-border)' }}
                                            >
                                                <div className='flex min-w-0 items-center gap-2'>
                                                    <FiFileText className='h-4 w-4 shrink-0' style={{ color: 'var(--color-primary-600)' }} />
                                                    <span className='truncate text-sm font-medium text-[var(--color-text)]'>
                                                        {file.originalName || file.name || 'PDF Документ'}
                                                    </span>
                                                    {file.size && (
                                                        <span className='shrink-0 text-xs text-[var(--color-text-muted)]'>
                                                            {formatBytes(file.size)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='flex items-center gap-1 shrink-0 ml-2'>
                                                    {file.url && (
                                                        <a
                                                            href={file.url}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            className='p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] transition-colors'
                                                            title='Открыть файл'
                                                        >
                                                            <FiExternalLink className='h-4 w-4' />
                                                        </a>
                                                    )}
                                                    <button
                                                        type='button'
                                                        onClick={() => removeExistingFile(file.id)}
                                                        className='p-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger-600)] cursor-pointer'
                                                        title='Удалить файл'
                                                    >
                                                        <FiTrash2 className='h-4 w-4' />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Зона Drag & Drop для новых файлов */}
                            {existingFiles.length + newFiles.length < MAX_FILES && (
                                <div
                                    onClick={() => inputRef.current?.click()}
                                    onDragOver={e => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed px-4 py-8 text-center transition-colors'
                                    style={{
                                        borderColor: isDragging ? 'var(--color-primary-500)' : 'var(--color-border)',
                                        backgroundColor: isDragging ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
                                    }}
                                >
                                    <FiUploadCloud className='h-7 w-7' style={{ color: 'var(--color-primary-600)' }} />
                                    <p className='text-sm text-[var(--color-text)]'>
                                        Перетащите новые PDF сюда или{' '}
                                        <span className='font-semibold text-[var(--color-brand)]'>выберите на устройстве</span>
                                    </p>
                                    <p className='text-xs text-[var(--color-text-muted)]'>
                                        {existingFiles.length + newFiles.length}/{MAX_FILES} файлов выбрано · только .pdf
                                    </p>
                                    <input
                                        ref={inputRef}
                                        type='file'
                                        accept='application/pdf,.pdf'
                                        multiple
                                        className='hidden'
                                        onChange={e => {
                                            if (e.target.files?.length) addFiles(e.target.files);
                                            e.target.value = '';
                                        }}
                                    />
                                </div>
                            )}

                            {fileError && (
                                <p className='mt-2 flex items-center gap-1.5 text-xs text-[var(--color-danger-600)]'>
                                    <FiAlertCircle className='h-3.5 w-3.5 shrink-0' />
                                    {fileError}
                                </p>
                            )}

                            {/* Список добавленных НОВЫХ файлов */}
                            {newFiles.length > 0 && (
                                <div className='mt-3 space-y-2'>
                                    <p className='text-xs font-semibold uppercase tracking-wider text-[var(--color-success-600)]'>
                                        Новые файлы к загрузке ({newFiles.length})
                                    </p>
                                    <ul className='space-y-2'>
                                        {newFiles.map((file, index) => (
                                            <li
                                                key={`${file.name}-${index}`}
                                                className='flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2'
                                                style={{ borderColor: 'var(--color-border)' }}
                                            >
                                                <div className='flex min-w-0 items-center gap-2'>
                                                    <FiFile className='h-4 w-4 shrink-0' style={{ color: 'var(--color-success-600)' }} />
                                                    <span className='truncate text-sm text-[var(--color-text)]'>{file.name}</span>
                                                    <span className='shrink-0 text-xs text-[var(--color-text-muted)]'>{formatBytes(file.size)}</span>
                                                </div>
                                                <button
                                                    type='button'
                                                    onClick={() => removeNewFile(index)}
                                                    className='ml-2 shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger-600)] cursor-pointer'
                                                >
                                                    <FiX className='h-4 w-4' />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Кнопки действий */}
                        <div className='flex gap-3 pt-2'>
                            <Button type='button' variant='outline' onClick={() => router.back()}>
                                Отмена
                            </Button>

                            <Button type='submit' variant='primary' isLoading={updatePostMutation.isPending}>
                                {updatePostMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPostPage;
