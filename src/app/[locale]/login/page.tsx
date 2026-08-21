'use client';
import Link from 'next/link';
import { FormEvent,useEffect,useState } from 'react';
import { useParams,useRouter } from 'next/navigation';
import { apiFetch,errorMessage } from '@/lib/api-client';
import { getDictionary,isLocale } from '@/i18n/dictionary';
import { BrandLogo } from '@/components/ui/BrandLogo';

type Me={role:string};
export default function LoginPage(){
 const params=useParams<{locale:string}>();const locale=isLocale(params.locale)?params.locale:'en';const d=getDictionary(locale);const router=useRouter();
 const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');const[busy,setBusy]=useState(false);
 useEffect(()=>{apiFetch<Me>('/auth/me').then(me=>router.replace(`/${locale}/${me.role==='SUPER_ADMIN'?'admin':'dashboard'}`)).catch(()=>{})},[locale,router]);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const me=await apiFetch<Me>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});router.replace(`/${locale}/${me.role==='SUPER_ADMIN'?'admin':'dashboard'}`)}catch(err){setError(errorMessage(err,d.auth.failed))}finally{setBusy(false)}}
 return <main className="auth-page" dir={locale==='ar'?'rtl':'ltr'}><section className="auth-visual"><BrandLogo inverse/><div className="auth-visual__content"><span>BRAVA EVENT TECHNOLOGY</span><h2>Every memory.<br/>One remarkable experience.</h2><p>Secure event media, refined guest journeys, and complete operational control.</p><div className="auth-metrics"><div><strong>Secure</strong><small>Validated media pipeline</small></div><div><strong>Private</strong><small>Role-based client access</small></div><div><strong>Live</strong><small>Real-time event control</small></div></div></div><small className="auth-visual__footer">A product by Brava Tech</small></section><section className="auth-form-side"><div className="auth-mobile-brand"><BrandLogo/></div><form className="auth-card" onSubmit={submit}><span className="auth-eyebrow">OWNER & ADMIN ACCESS</span><h1>{d.auth.title}</h1><p>{d.auth.subtitle}</p><label className="field"><span>{d.auth.email}</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label><label className="field"><span>{d.auth.password}</span><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error&&<div className="notice notice--error" role="alert"><strong>Sign in failed</strong><span>{error}</span></div>}<button className="button button--primary button--wide" disabled={busy}>{busy?d.common.loading:d.auth.login}</button><p className="auth-switch">{d.auth.noAccount} <Link href={`/${locale}/register`}>{d.auth.registerLink}</Link></p><small className="auth-security">Protected by secure HttpOnly authentication and role-based access.</small></form></section></main>
}
