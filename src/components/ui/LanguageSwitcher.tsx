'use client';
import { useEffect } from 'react';
import { usePathname,useRouter } from 'next/navigation';
import type { Locale } from '@/i18n/dictionary';
export function LanguageSwitcher({locale}:{locale:Locale}){
  const path=usePathname();const router=useRouter();
  const next=locale==='en'?'ar':'en';
  const nextPath=path.replace(`/${locale}/`,`/${next}/`);
  useEffect(()=>{router.prefetch(nextPath);},[router,nextPath]);
  return <button className="language-switcher" onClick={()=>router.push(nextPath)}>{locale==='en'?'ع':'EN'}</button>;
}
