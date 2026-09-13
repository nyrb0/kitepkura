'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiClock, FiCheckCircle } from 'react-icons/fi';

interface Props {
    deadline: string;
    isArchive?: boolean;
    onExpire?: () => void;
}

const russianUnits = [
    ['день', 'дня', 'дней'],
    ['час', 'часа', 'часов'],
    ['минута', 'минуты', 'минут'],
    ['секунда', 'секунды', 'секунд'],
];
const kyrgyzUnits = ['күн', 'саат', 'мүнөт', 'секунда'];
const plurals = new Intl.PluralRules('ru');

export default function PostDeadlineTimer({ deadline, isArchive = false, onExpire }: Props) {
    const { i18n } = useTranslation();
    const kyrgyz = /^(kg|ky)(-|$)/.test(i18n.language);
    const end = new Date(deadline).getTime();
    const [clock, setClock] = useState<{ end: number; now: number } | null>(null);
    const remaining = clock?.end === end ? Math.max(0, Math.ceil((end - clock.now) / 1000)) : null;
    const expired = remaining === 0;
    const closed = isArchive || expired;

    useEffect(() => {
        if (!Number.isFinite(end) || isArchive) return;
        const tick = () => {
            const now = Date.now();
            setClock({ end, now });
            if (now >= end) clearInterval(timer);
        };
        const timer = setInterval(tick, 1000);
        tick();
        document.addEventListener('visibilitychange', tick);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', tick);
        };
    }, [end, isArchive]);

    useEffect(() => {
        if (expired) onExpire?.();
    }, [expired, onExpire]);

    if (!Number.isFinite(end)) return null;

    const urgent = remaining !== null && remaining > 0 && remaining < 86400;
    const values = remaining === null ? [null, null, null, null] : [
        Math.floor(remaining / 86400),
        Math.floor(remaining / 3600) % 24,
        Math.floor(remaining / 60) % 60,
        remaining % 60,
    ];
    const formattedDate = new Intl.DateTimeFormat(kyrgyz ? 'ky-KG' : 'ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bishkek',
    }).format(end);

    return (
        <section title={`${formattedDate} · ${kyrgyz ? 'Бишкек убактысы' : 'время Бишкека'}`} className={`mt-4 w-fit max-w-full rounded-xl  px-3 py-2.5 ${closed
            ? 'border-border bg-neutral-100'
            : urgent ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-surface'
                : 'border-primary-200 bg-gradient-to-br from-primary-50 to-surface'}`}>
            <div className='flex items-center gap-2'>
                <span className={`shrink-0 ${closed ? 'text-text-muted' : urgent ? 'text-amber-700' : 'text-primary-700'}`}>
                    {closed ? <FiCheckCircle aria-hidden className='h-3.5 w-3.5' /> : <FiClock aria-hidden className='h-3.5 w-3.5' />}
                </span>
                <div>
                    <h2 className='text-xs font-medium text-text-muted' aria-live='polite'>
                        {closed
                            ? kyrgyz ? 'Арыз кабыл алуу аяктады' : 'Приём заявок завершён'
                            : kyrgyz ? 'Арыз берүүгө калган убакыт' : 'До окончания подачи заявок'}
                    </h2>
                    <p className='sr-only'>
                        <time dateTime={deadline}>{formattedDate}</time> · {kyrgyz ? 'Бишкек убактысы' : 'время Бишкека'}
                    </p>
                </div>
            </div>

            {!closed && (
                <div role='timer' aria-live='off' aria-label={kyrgyz ? 'Калган убакыт' : 'Оставшееся время'} className='mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1'>
                    {values.map((value, index) => {
                        const plural = plurals.select(value ?? 0);
                        const label = kyrgyz ? kyrgyzUnits[index] : russianUnits[index][plural === 'one' ? 0 : plural === 'few' ? 1 : 2];
                        return (
                            <div key={index} className='flex items-baseline gap-1 whitespace-nowrap'>
                                <span className={`text-base font-semibold leading-tight tabular-nums ${urgent ? 'text-amber-700' : 'text-primary-800'}`}>
                                    {value === null ? '—' : String(value).padStart(2, '0')}
                                </span>
                                <span className='text-[11px] text-text-muted'>{label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
