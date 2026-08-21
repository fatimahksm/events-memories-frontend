import { redirect } from 'next/navigation';
import { appConfig } from '@/config/app-config';
import { isLocale } from '@/i18n/dictionary';

export default function Home() {
  const locale = isLocale(appConfig.defaultLocale) ? appConfig.defaultLocale : 'en';
  redirect(`/${locale}/login`);
}
