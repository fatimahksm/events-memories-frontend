'use client';
import { BrandLogo } from '@/components/ui/BrandLogo';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="system-page"><BrandLogo/><div><span>APPLICATION ERROR</span><h1>We couldn’t load this page</h1><p>Your data is safe. Retry the request, and contact Brava support if the issue continues.</p><button className="button button--primary" onClick={reset}>Try again</button></div></main>}
