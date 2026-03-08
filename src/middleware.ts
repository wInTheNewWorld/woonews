import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptLang = request.headers.get('accept-language') || '';
  const isChinese = acceptLang.toLowerCase().includes('zh');

  if (pathname === '/') {
    if (!isChinese) return NextResponse.redirect(new URL('/en', request.url));
    return NextResponse.next();
  }
  if (pathname === '/en') {
    if (isChinese) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }
  if (pathname === '/docs') {
    if (!isChinese) return NextResponse.redirect(new URL('/en/docs', request.url));
    return NextResponse.next();
  }
  if (pathname === '/en/docs') {
    if (isChinese) return NextResponse.redirect(new URL('/docs', request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/en', '/docs', '/en/docs'],
};
