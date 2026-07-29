import { NextRequest, NextResponse } from 'next/server';

const languages = new Set(['kg', 'ru']);

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/');
    const locale = segments[1];
    let response: NextResponse | null = null;
    let effectivePathname = pathname;

    if (languages.has(locale)) {
        const pathnameWithoutLocale = `/${segments.slice(2).join('/')}`;
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = pathnameWithoutLocale === '/' ? '/' : pathnameWithoutLocale.replace(/\/$/, '');

        response = NextResponse.rewrite(rewriteUrl);
        response.cookies.set('kitepkuraLanguage', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
        effectivePathname = rewriteUrl.pathname;
    }

    if (effectivePathname === '/admin/login') {
        if (token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        return response ?? NextResponse.next();
    }

    if (effectivePathname.startsWith('/admin') && !token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return response ?? NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/kg/:path*', '/ru/:path*', '/'],
};
