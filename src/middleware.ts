import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptLang = request.headers.get('accept-language') || '';
  const isChinese = acceptLang.toLowerCase().includes('zh');

  // / → /en 或保持
  if (pathname === '/') {
    if (!isChinese) return NextResponse.redirect(new URL('/en', request.url));
    return NextResponse.next();
  }

  // /en → / 如果是中文用户
  if (pathname === '/en') {
    if (isChinese) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // /docs → /en/docs 如果非中文
  if (pathname === '/docs') {
    if (!isChinese) return NextResponse.redirect(new URL('/en/docs', request.url));
    return NextResponse.next();
  }

  // /en/docs → /docs 如果是中文
  if (pathname === '/en/docs') {
    if (isChinese) return NextResponse.redirect(new URL('/docs', request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/en', '/docs', '/en/docs'],
};
