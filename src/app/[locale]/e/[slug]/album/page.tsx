import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AlbumPageClient } from './album-client';
import { getDictionary, isLocale } from '@/i18n/dictionary';
import { appConfig } from '@/config/app-config';
import type { PublicEvent } from '@/types/event';

async function getEvent(slug: string): Promise<PublicEvent | null> {
  const response = await fetch(`${appConfig.apiBaseUrl}/public/events/${slug}`, { cache: 'no-store' });
  if (response.status === 404 || response.status === 410) return null;
  if (!response.ok) throw new Error('EVENT_FETCH_FAILED');
  return response.json();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event not found' };
  const name = locale === 'ar' ? event.namesAr || event.names : event.names;
  return { title: `${name} — Album` };
}

export default async function EventAlbumPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const event = await getEvent(slug);
  if (!event) notFound();
  return <AlbumPageClient event={event} dictionary={getDictionary(locale)} locale={locale} />;
}
