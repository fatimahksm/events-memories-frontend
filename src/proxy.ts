import { NextRequest, NextResponse } from 'next/server';
import { isLocale, locales, type Locale } from '@/i18n/dictionary';
import { appConfig } from '@/config/app-config';

const DEFAULT_LOCALE: Locale = isLocale(appConfig.defaultLocale) ? appConfig.defaultLocale : 'en';

function detectLocale(request: NextRequest): Locale {
  const header = request.headers.get('accept-language');
  if (header) {
    for (const part of header.split(',')) {
      const base = part.split(';')[0].trim().toLowerCase().split('-')[0];
      if (isLocale(base)) return base;
    }
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}/login` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|brand|favicon.ico|.*\\..*).*)'],
};
