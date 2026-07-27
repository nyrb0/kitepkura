'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { fallbackLng, languages, type Language } from './client';

export function useCurrentLanguage(): Language {
    const pathname = usePathname();
    const locale = pathname.split('/')[1];

    return locale in languages ? (locale as Language) : fallbackLng;
}

export function useLocalizedPath() {
    const language = useCurrentLanguage();

    return useCallback(
        (href: string) => {
            if (!href.startsWith('/')) {
                return href;
            }

            const firstSegment = href.split('/')[1];
            if (firstSegment in languages) {
                return href;
            }

            if (href === '/') {
                return `/${language}`;
            }

            return `/${language}${href}`;
        },
        [language],
    );
}
