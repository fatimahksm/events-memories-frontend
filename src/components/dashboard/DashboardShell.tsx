'use client';
import Link from 'next/link';
import { CSSProperties, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { BrandLogo } from '@/components/ui/BrandLogo';
import type { EventTheme } from '@/types/event';

export function DashboardShell({title,subtitle,locale,logoutLabel,role='OWNER',theme,nav,children}:{title:string;subtitle?:string;locale:string;logoutLabel:string;role?:'OWNER'|'SUPER_ADMIN';theme?:EventTheme|null;nav?:ReactNode;children:ReactNode}){
 const router=useRouter();const[collapsed,setCollapsed]=useState(false);
 async function logout(){await apiFetch('/auth/logout',{method:'POST'}).catch(()=>{});router.replace(`/${locale}/login`)}
 // Always tint dark, whether there's a background image or just the flat theme-color gradient
 // underneath — the sidebar's white/light-gray text needs to stay legible no matter which
 // (possibly light) colors an owner picked for their event's public-facing theme.
 const sidebarStyle:CSSProperties|undefined=theme?{
   '--event-primary':theme.primaryColor,
   '--event-accent':theme.accentColor,
   backgroundImage:`linear-gradient(180deg,rgba(6,19,46,${Math.max(theme.overlayOpacity,.55)}),rgba(6,19,46,${Math.min(theme.overlayOpacity+.35,.96)})),${theme.backgroundImageUrl?`url("${theme.backgroundImageUrl}")`:`linear-gradient(180deg,${theme.primaryColor},${theme.accentColor})`}`,
   backgroundSize:'cover',
   backgroundPosition:`${theme.backgroundPositionX}% ${theme.backgroundPositionY}%`,
 } as CSSProperties:undefined;
 return <main className={`app-shell ${collapsed?'app-shell--collapsed':''}`} dir={locale==='ar'?'rtl':'ltr'}><aside className={`app-sidebar ${theme?'app-sidebar--themed':''} ${collapsed?'app-sidebar--collapsed':''}`} style={sidebarStyle}><div className="sidebar-head"><BrandLogo inverse compact={collapsed}/><button className="sidebar-collapse" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expand navigation':'Collapse navigation'}><ChevronIcon flipped={locale==='ar'?!collapsed:collapsed}/></button></div>{!collapsed&&<div className="sidebar-context"><span>{role==='SUPER_ADMIN'?'Platform console':'Owner workspace'}</span><strong>{role==='SUPER_ADMIN'?'Super Admin':'Event Manager'}</strong></div>}{nav&&<nav className="sidebar-nav">{nav}</nav>}<div className="sidebar-spacer"/>{!collapsed&&<div className="sidebar-status"><span className="status-dot"/><div><strong>System operational</strong><small>Secure media processing</small></div></div>}<div className="sidebar-footer"><Link href={`/${locale==='ar'?'en':'ar'}/${role==='SUPER_ADMIN'?'admin':'dashboard'}`}>{locale==='ar'?'EN':'AR'}</Link><button onClick={logout}>{collapsed?'⏻':logoutLabel}</button></div></aside><section className="app-main"><header className="app-topbar"><div><p>{role==='SUPER_ADMIN'?'BRAVA CONTROL CENTER':'BRAVA OWNER PORTAL'}</p><h1>{title}</h1>{subtitle&&<span>{subtitle}</span>}</div><div className="topbar-account"><span>{role==='SUPER_ADMIN'?'SA':'OW'}</span><div><strong>{role==='SUPER_ADMIN'?'Super Admin':'Event Owner'}</strong><small>Authenticated session</small></div></div></header><div className="app-content">{children}</div></section></main>
}

function ChevronIcon({flipped}:{flipped:boolean}){return <svg viewBox="0 0 24 24" aria-hidden="true" style={{transform:flipped?'rotate(180deg)':'none'}}><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
