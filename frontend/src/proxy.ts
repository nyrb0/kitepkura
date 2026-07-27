import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    if (pathname === '/admin/login') {
        if (token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
