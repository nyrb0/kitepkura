'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { I18nextProvider } from 'react-i18next';
import i18n, { fallbackLng, languages, type Language } from './client';

type I18nProviderProps = {
    children: React.ReactNode;
    initialLanguage?: string;
};

export default function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
    const pathname = usePathname();
    const localeFromPath = pathname.split('/')[1];
    const currentLanguage = localeFromPath in languages ? (localeFromPath as Language) : initialLanguage || fallbackLng;

    // Синхронно, во время рендера (не в эффекте!) синхронизируем язык
    if (i18n.language !== currentLanguage) {
        i18n.changeLanguage(currentLanguage);
    }

    useEffect(() => {
        document.documentElement.lang = currentLanguage;
    }, [currentLanguage]);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
