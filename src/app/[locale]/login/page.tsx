'use client';
import { FormEvent,Suspense,useEffect,useState } from 'react';
import { useParams,useRouter,useSearchParams } from 'next/navigation';
import { apiFetch,errorMessage } from '@/lib/api-client';
import { getDictionary,isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { AuthVisualPanel } from '@/components/ui/AuthVisualPanel';
import type { PublicEvent } from '@/types/event';

type Me={role:string};
export default function LoginPage(){
 return <Suspense fallback={null}><LoginForm/></Suspense>;
}
function LoginForm(){
 const params=useParams<{locale:string}>();const locale=isLocale(params.locale)?params.locale:'en';const d=getDictionary(locale);const router=useRouter();
 const searchParams=useSearchParams();const eventSlug=searchParams.get('event');
 const[event,setEvent]=useState<PublicEvent|null>(null);
 const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState(false);
 function routeFor(role:string){return role==='SUPER_ADMIN'?`/${locale}/admin`:`/${locale}/dashboard`}
 // An event-scoped login link is a deliberate request to sign in as that event's owner —
 // skip the "already signed in, skip to dashboard" shortcut so a stale session from a
 // different account (e.g. an admin testing the link) doesn't silently bounce them away
 // from the form before they can enter that owner's own credentials.
 useEffect(()=>{if(eventSlug)return;apiFetch<Me>('/auth/me').then(me=>{router.replace(routeFor(me.role))}).catch(()=>{})},[locale,router,eventSlug]);
 useEffect(()=>{if(!eventSlug)return;apiFetch<PublicEvent>(`/public/events/${eventSlug}`).then(setEvent).catch(()=>{})},[eventSlug]);
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const me=await apiFetch<Me>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
   router.replace(routeFor(me.role));
  }catch(err){setError(errorMessage(err,d.auth.failed))}finally{setBusy(false)}
 }
 const eventName=event?(locale==='ar'?(event.namesAr||event.names):event.names):null;
 return <main className="auth-page" dir={locale==='ar'?'rtl':'ltr'}><AuthVisualPanel event={event} locale={locale}/><section className="auth-form-side"><div className="auth-mobile-brand"><BrandLogo/></div><form className="auth-card" onSubmit={submit}><span className="auth-eyebrow">{eventName?`SIGNING IN TO ${eventName.toUpperCase()}`:'ACCOUNT ACCESS'}</span><h1>{d.auth.title}</h1><p>{d.auth.subtitle}</p><label className="field"><span>{d.auth.email}</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label><label className="field"><span>{d.auth.password}</span><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label><a className="auth-forgot-link" href={`/${locale}/forgot-password`}>{d.auth.forgotPassword}</a>{error&&<div className="notice notice--error" role="alert"><strong>Sign in failed</strong><span>{error}</span></div>}<button className="button button--primary button--wide" disabled={busy}>{busy?d.common.loading:d.auth.login}</button></form></section></main>
}
