'use client';
import { useState } from 'react';
import { EventHero } from '@/components/event/EventHero';
import { Album } from '@/components/event/Album';
import { Wishes } from '@/components/event/Wishes';
import { UploadPanel } from '@/components/upload/UploadPanel';
import type { Dictionary,Locale } from '@/i18n/dictionary';import type { PublicEvent } from '@/types/event';
export function EventPageClient({event,dictionary,locale}:{event:PublicEvent;dictionary:Dictionary;locale:Locale}){const[open,setOpen]=useState(false);const[refresh,setRefresh]=useState(0);return <main dir={locale==='ar'?'rtl':'ltr'}><EventHero event={event} dictionary={dictionary} locale={locale} onUpload={()=>setOpen(true)}/><Album slug={event.slug} dictionary={dictionary} refreshKey={refresh}/><Wishes slug={event.slug} dictionary={dictionary}/><footer className="public-footer"><span/><small>{event.names}</small></footer>{open&&<UploadPanel dictionary={dictionary} eventSlug={event.slug} onClose={()=>setOpen(false)} onUploaded={()=>setTimeout(()=>setRefresh(x=>x+1),1800)}/>}</main>}
