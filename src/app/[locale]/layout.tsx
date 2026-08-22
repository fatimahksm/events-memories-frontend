import type { ReactNode } from 'react';
import { isLocale } from '@/i18n/dictionary';
import { LocaleAttributes } from '@/components/ui/LocaleAttributes';

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <>
      <LocaleAttributes locale={locale} dir={dir} />
      {children}
    </>
  );
}
