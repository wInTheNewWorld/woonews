import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只处理根路径和 /en 路径
  if (pathname !== '/' && pathname !== '/en') return NextResponse.next();

  const acceptLang = request.headers.get('accept-language') || '';
  const isChinese = acceptLang.toLowerCase().includes('zh');

  if (isChinese && pathname === '/en') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  if (!isChinese && pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/en'],
};
