import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/shared/provider/QueryProvider';

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
