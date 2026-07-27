'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';

import kgCommon from '@/locales/kg/common.json';
import ruCommon from '../../locales/ru/common.json';

export const fallbackLng = 'ru';
export const defaultNS = 'common';

export const languages = {
    kg: 'KG',
    ru: 'RU',
} as const;

export type Language = keyof typeof languages;

const resources = {
    kg: {
        common: kgCommon,
    },
    ru: {
        common: ruCommon,
    },
};

const storageKey = 'kitepkuraLanguage';

const isLanguage = (language: string): language is Language => language in languages;

const getLanguage = (): Language => {
    if (typeof window === 'undefined') {
        return fallbackLng; // сервер -> всегда 'ru'
    }

    const savedLanguage = Cookies.get(storageKey);
    if (savedLanguage && isLanguage(savedLanguage)) {
        return savedLanguage; // клиент -> может быть 'kg' из cookie
    }

    return fallbackLng;
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources,

        // было lng: fallbackLng
        lng: getLanguage(),

        fallbackLng,

        defaultNS,

        ns: [defaultNS],

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });
}

export const changeLanguage = async (language: Language) => {
    await i18n.changeLanguage(language);

    if (typeof window !== 'undefined') {
        Cookies.set(storageKey, language, {
            expires: 365,
        });

        document.documentElement.lang = language;
    }
};

export default i18n;
