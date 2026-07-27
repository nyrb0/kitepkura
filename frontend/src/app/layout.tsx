import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/shared/provider/QueryProvider';
import I18nProvider from '@/shared/i18next/I18nProvider';

export const metadata: Metadata = {
    title: 'Ачык конкурстар',
    description: '',
    icons: {
        icon: [
            {
                url: '/logo.png',
                href: '/logo.png',
            },
        ],
        apple: '/logo.png',
    },
};

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{
        lang: string;
    }>;
}) {
    const { lang } = await params;
    return (
        <html lang={lang}>
            <body>
                <QueryProvider>
                    <I18nProvider initialLanguage={lang}>{children}</I18nProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
