'use client';
import { useState } from 'react';
import { EventHero } from '@/components/event/EventHero';
import { Album } from '@/components/event/Album';
import { Wishes } from '@/components/event/Wishes';
import { UploadPanel } from '@/components/upload/UploadPanel';
import type { Dictionary,Locale } from '@/i18n/dictionary';import type { PublicEvent } from '@/types/event';
export function EventPageClient({event,dictionary,locale}:{event:PublicEvent;dictionary:Dictionary;locale:Locale}){const[open,setOpen]=useState(false);const[refresh,setRefresh]=useState(0);const[colorMode,setColorMode]=useState(event.theme.colorMode);return <main dir={locale==='ar'?'rtl':'ltr'} data-color-mode={colorMode.toLowerCase()}><EventHero event={event} dictionary={dictionary} locale={locale} colorMode={colorMode} onToggleColorMode={()=>setColorMode(m=>m==='DARK'?'LIGHT':'DARK')} onUpload={()=>setOpen(true)}/><Album slug={event.slug} locale={locale} dictionary={dictionary} refreshKey={refresh}/><Wishes slug={event.slug} dictionary={dictionary}/><footer className="public-footer"><span/><small>{event.names}</small></footer>{open&&<UploadPanel dictionary={dictionary} eventSlug={event.slug} onClose={()=>setOpen(false)} onUploaded={()=>setTimeout(()=>setRefresh(x=>x+1),1800)}/>}</main>}
