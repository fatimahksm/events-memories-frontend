'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function DashboardShell({title,subtitle,locale,logoutLabel,role='OWNER',children}:{title:string;subtitle?:string;locale:string;logoutLabel:string;role?:'OWNER'|'SUPER_ADMIN';children:ReactNode}){
 const router=useRouter();async function logout(){await apiFetch('/auth/logout',{method:'POST'}).catch(()=>{});router.replace(`/${locale}/login`)}
 return <main className="app-shell" dir={locale==='ar'?'rtl':'ltr'}><aside className="app-sidebar"><BrandLogo inverse/><div className="sidebar-context"><span>{role==='SUPER_ADMIN'?'Platform console':'Owner workspace'}</span><strong>{role==='SUPER_ADMIN'?'Super Admin':'Event Manager'}</strong></div><div className="sidebar-spacer"/><div className="sidebar-status"><span className="status-dot"/><div><strong>System operational</strong><small>Secure media processing</small></div></div><div className="sidebar-footer"><Link href={`/${locale==='ar'?'en':'ar'}/${role==='SUPER_ADMIN'?'admin':'dashboard'}`}>{locale==='ar'?'English':'العربية'}</Link><button onClick={logout}>{logoutLabel}</button></div></aside><section className="app-main"><header className="app-topbar"><div><p>{role==='SUPER_ADMIN'?'BRAVA CONTROL CENTER':'BRAVA OWNER PORTAL'}</p><h1>{title}</h1>{subtitle&&<span>{subtitle}</span>}</div><div className="topbar-account"><span>{role==='SUPER_ADMIN'?'SA':'OW'}</span><div><strong>{role==='SUPER_ADMIN'?'Super Admin':'Event Owner'}</strong><small>Authenticated session</small></div></div></header><div className="app-content">{children}</div></section></main>
}
