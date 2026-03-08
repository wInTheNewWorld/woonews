import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptLang = request.headers.get('accept-language') || '';
  const isChinese = acceptLang.toLowerCase().includes('zh');

  // 用户主动点了语言切换（通过 referer 判断来自同站）
  const referer = request.headers.get('referer') || '';
  const isManualSwitch = referer.includes('woonews.site') || referer.includes('localhost');

  // 主动切换时不强制重定向，让用户停在选择的语言
  if (isManualSwitch) return NextResponse.next();

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
