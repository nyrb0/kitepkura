'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiFileText, FiType, FiAlertCircle, FiLink } from 'react-icons/fi';
import { postService } from '@/shared/services/post.service';
import { routers } from '@/app/router.const';
import { Input } from '@/shared/UI/Input';
import { Button } from '@/shared/UI/Button';

type Locale = 'ru' | 'kg';

type CreatePostFormValues = {
    name: Record<Locale, string>;
    description: Record<Locale, string>;
    urlForm: string;
};

const MAX_FILES = 10;
const ACCEPTED_TYPE = 'application/pdf';

const LOCALES: { key: Locale; label: string }[] = [
    { key: 'ru', label: 'Русский' },
    { key: 'kg', label: 'Кыргызча' },
];

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const units = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

const isPdf = (file: File) => file.type === ACCEPTED_TYPE || file.name.toLowerCase().endsWith('.pdf');

const CreatePostPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const inputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [activeLocale, setActiveLocale] = useState<Locale>('ru');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreatePostFormValues>({
        mode: 'onBlur',
        defaultValues: {
            name: { ru: '', kg: '' },
            description: { ru: '', kg: '' },
            urlForm: '',
        },
    });

    const createPostMutation = useMutation({
        mutationFn: (formData: FormData) => postService.create(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            reset();
            setFiles([]);
            router.push(routers.admin.posts);
        },
    });

    const addFiles = useCallback((incoming: FileList | File[]) => {
        const incomingArr = Array.from(incoming);
        const pdfFiles = incomingArr.filter(isPdf);
        const rejectedCount = incomingArr.length - pdfFiles.length;

        setFileError(rejectedCount > 0 ? 'Можно загружать только PDF-файлы' : null);

        if (pdfFiles.length === 0) return;

        setFiles(prev => {
            const merged = [...prev, ...pdfFiles];
            return merged.slice(0, MAX_FILES);
        });
    }, []);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = (data: CreatePostFormValues) => {
        const formData = new FormData();

        formData.append('name[ru]', data.name.ru);
        formData.append('name[kg]', data.name.kg);

        formData.append('description[ru]', data.description.ru);
        formData.append('description[kg]', data.description.kg);

        formData.append('urlForm', data.urlForm);
        files.forEach(file => formData.append('files', file));

        createPostMutation.mutate(formData);
    };

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
                        <h1 className='text-2xl font-bold tracking-tight text-[var(--color-text)]'>Новый пост</h1>
                    </div>
                    <p className='text-sm text-[var(--color-text-muted)]'>Заполните информацию на обоих языках и прикрепите PDF-файлы</p>
                </div>

                {/* Карточка */}
                <div
                    className='rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8'
                    style={{ boxShadow: 'var(--shadow-elevated)' }}
                >
                    {createPostMutation.isError && (
                        <div
                            className='mb-6 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                            style={{
                                borderColor: 'var(--color-danger-500)',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                color: 'var(--color-danger-600)',
                            }}
                        >
                            {createPostMutation.error instanceof Error ? createPostMutation.error.message : 'Произошла ошибка при создании поста'}
                        </div>
                    )}

                    {createPostMutation.isSuccess && (
                        <div
                            className='mb-6 flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm'
                            style={{
                                borderColor: 'var(--color-success-500)',
                                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                                color: 'var(--color-success-600)',
                            }}
                        >
                            <FiCheckCircle className='h-4 w-4 shrink-0' />
                            Пост успешно создан
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
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
                                {/* Название с использованием компонента Input */}
                                <Input
                                    label={`Название (${locale.label})`}
                                    placeholder='Введите название поста'
                                    leftIcon={<FiType className='h-4.5 w-4.5' />}
                                    error={errors.name?.[locale.key]?.message}
                                    {...register(`name.${locale.key}`, {
                                        required: 'Введите название',
                                    })}
                                />

                                {/* Описание (оставлен textarea, так как UI-инпут обычный text) */}
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

                        {/* Ссылка на форму с использованием компонента Input */}
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

                        {/* Загрузка файлов */}
                        <div>
                            <label className='mb-1.5 block text-sm font-medium text-[var(--color-text)]'>
                                PDF-файлы <span className='font-normal text-[var(--color-text-muted)]'>(до {MAX_FILES})</span>
                            </label>

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
                                    Перетащите PDF сюда или <span className='font-semibold text-[var(--color-brand)]'>выберите на устройстве</span>
                                </p>
                                <p className='text-xs text-[var(--color-text-muted)]'>
                                    {files.length}/{MAX_FILES} файлов выбрано · только .pdf
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

                            {fileError && (
                                <p className='mt-2 flex items-center gap-1.5 text-xs text-[var(--color-danger-600)]'>
                                    <FiAlertCircle className='h-3.5 w-3.5 shrink-0' />
                                    {fileError}
                                </p>
                            )}

                            {files.length > 0 && (
                                <ul className='mt-3 space-y-2'>
                                    {files.map((file, index) => (
                                        <li
                                            key={`${file.name}-${index}`}
                                            className='flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2'
                                            style={{ borderColor: 'var(--color-border)' }}
                                        >
                                            <div className='flex min-w-0 items-center gap-2'>
                                                <FiFile className='h-4 w-4 shrink-0' style={{ color: 'var(--color-primary-600)' }} />
                                                <span className='truncate text-sm text-[var(--color-text)]'>{file.name}</span>
                                                <span className='shrink-0 text-xs text-[var(--color-text-muted)]'>{formatBytes(file.size)}</span>
                                            </div>
                                            <button
                                                type='button'
                                                onClick={() => removeFile(index)}
                                                className='ml-2 shrink-0 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger-600)] cursor-pointer'
                                            >
                                                <FiX className='h-4 w-4' />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Кнопки действий */}
                        <div className='flex gap-3 pt-2'>
                            <Button type='button' variant='outline' onClick={() => router.back()}>
                                Отмена
                            </Button>

                            <Button type='submit' variant='primary' isLoading={createPostMutation.isPending}>
                                {createPostMutation.isPending ? 'Публикация...' : 'Опубликовать'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
