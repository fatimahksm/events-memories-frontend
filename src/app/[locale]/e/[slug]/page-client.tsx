'use client';
import { useEffect, useState } from 'react';
import { EventHero } from '@/components/event/EventHero';
import { Album } from '@/components/event/Album';
import { Wishes } from '@/components/event/Wishes';
import { UploadPanel } from '@/components/upload/UploadPanel';
import type { Dictionary,Locale } from '@/i18n/dictionary';import type { PublicEvent } from '@/types/event';
export function EventPageClient({event,dictionary,locale}:{event:PublicEvent;dictionary:Dictionary;locale:Locale}){
  const[open,setOpen]=useState(false);
  const[refresh,setRefresh]=useState(0);
  const[colorMode,setColorMode]=useState(event.theme.colorMode);
  const[toast,setToast]=useState(false);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(false),4000);return()=>clearTimeout(t);},[toast]);
  return <main dir={locale==='ar'?'rtl':'ltr'} data-color-mode={colorMode.toLowerCase()}>
    <EventHero event={event} dictionary={dictionary} locale={locale} colorMode={colorMode} onToggleColorMode={()=>setColorMode(m=>m==='DARK'?'LIGHT':'DARK')} onUpload={()=>setOpen(true)}/>
    <Album slug={event.slug} locale={locale} dictionary={dictionary} refreshKey={refresh}/>
    <Wishes slug={event.slug} dictionary={dictionary}/>
    <footer className="public-footer"><span/><small>{event.names}</small><nav className="public-footer__legal"><a href={`/${locale}/terms`}>{dictionary.common.terms}</a><a href={`/${locale}/privacy`}>{dictionary.common.privacy}</a></nav></footer>
    {open&&<UploadPanel dictionary={dictionary} eventSlug={event.slug} onClose={()=>setOpen(false)} onUploaded={()=>setTimeout(()=>setRefresh(x=>x+1),1800)} onAllSucceeded={()=>setToast(true)}/>}
    {toast&&<div className="memory-toast" role="status" aria-live="polite"><span className="memory-toast__heart" aria-hidden="true">❤️</span><span>{dictionary.upload.successTitle}</span></div>}
  </main>;
}
