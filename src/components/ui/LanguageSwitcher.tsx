'use client';
import { usePathname,useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/dictionary';
export function LanguageSwitcher({locale}:{locale:Locale}){const path=usePathname();const router=useRouter();function toggle(){const next=locale==='en'?'ar':'en';router.push(path.replace(`/${locale}/`,`/${next}/`));}return <button className="language-switcher" onClick={toggle}>{locale==='en'?'ع':'EN'}</button>}
