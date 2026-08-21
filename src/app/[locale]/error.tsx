'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { BrandLogo } from '@/components/ui/BrandLogo';
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{Sentry.captureException(error);},[error]);return <main className="system-page"><BrandLogo/><div><span>APPLICATION ERROR</span><h1>We couldn’t load this page</h1><p>Your data is safe. Retry the request, and contact Brava support if the issue continues.</p><button className="button button--primary" onClick={reset}>Try again</button></div></main>}
