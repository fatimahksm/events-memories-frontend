'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useParams,useRouter } from 'next/navigation';
import { apiFetch,errorMessage } from '@/lib/api-client';
import { getDictionary,isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

type Me={role:string};
export default function LoginPage(){
 const params=useParams<{locale:string}>();const locale=isLocale(params.locale)?params.locale:'en';const d=getDictionary(locale);const router=useRouter();
 const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState(false);
 useEffect(()=>{apiFetch<Me>('/auth/me').then(me=>{if(me.role==='SUPER_ADMIN')router.replace(`/${locale}/admin`)}).catch(()=>{})},[locale,router]);
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const me=await apiFetch<Me>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
   if(me.role!=='SUPER_ADMIN'){
    await apiFetch('/auth/logout',{method:'POST'}).catch(()=>{});
    setError('This sign-in is for the Super Admin only. Ask your event administrator for your private workspace link instead.');
    return;
   }
   router.replace(`/${locale}/admin`);
  }catch(err){setError(errorMessage(err,d.auth.failed))}finally{setBusy(false)}
 }
 return <main className="auth-page" dir={locale==='ar'?'rtl':'ltr'}><section className="auth-visual"><BrandLogo inverse/><div className="auth-visual__content"><span>BRAVA CONTROL CENTER</span><h2>Run every event.<br/>From one command center.</h2><p>Publish beautiful event experiences and take care of every client, all from one place.</p><div className="auth-metrics"><div><MetricIcon type="shield"/><strong>Protected</strong><small>Every memory kept safe</small></div><div><MetricIcon type="layers"/><strong>Unified</strong><small>All your clients, one place</small></div><div><MetricIcon type="pulse"/><strong>Live</strong><small>See it happen as it happens</small></div></div></div><small className="auth-visual__footer">A product by Brava Tech</small></section><section className="auth-form-side"><div className="auth-mobile-brand"><BrandLogo/></div><form className="auth-card" onSubmit={submit}><span className="auth-eyebrow">SUPER ADMIN ACCESS</span><h1>{d.auth.title}</h1><p>{d.auth.subtitle}</p><label className="field"><span>{d.auth.email}</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label><label className="field"><span>{d.auth.password}</span><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error&&<div className="notice notice--error" role="alert"><strong>Sign in failed</strong><span>{error}</span></div>}<button className="button button--primary button--wide" disabled={busy}>{busy?d.common.loading:d.auth.login}</button><small className="auth-security">Event owners don&rsquo;t sign in here — they open their private workspace link.</small></form></section></main>
}

function MetricIcon({type}:{type:'shield'|'layers'|'pulse'}){return <svg viewBox="0 0 24 24" aria-hidden="true">{type==='shield'?<path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>:type==='layers'?<path d="M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>:<path d="M2 12h4l2-7 4 14 2-7h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>}</svg>}
