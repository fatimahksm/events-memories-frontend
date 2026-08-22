import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';

export const metadata: Metadata = {
  title: { default: 'Brava Event Memories', template: '%s | Brava Event Memories' },
  icons: { icon: '/brand/brava-logo.png', shortcut: '/brand/brava-logo.png', apple: '/brand/brava-logo.png' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={fontVariables} suppressHydrationWarning><body>{children}</body></html>;
}
