import type { NextConfig } from 'next';
const securityHeaders=[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}
];
// Vercel runs its own build adapter that packages output itself; `output: 'standalone'`
// changes what `next build` emits (its own file-tracing into `.next/standalone`) in a way
// that breaks Vercel's adapter. Only set it for self-hosted (Docker/Render) builds.
const nextConfig:NextConfig={...(process.env.VERCEL?{}:{output:'standalone'}),images:{remotePatterns:[{protocol:'https',hostname:'**'}]},async headers(){return[{source:'/(.*)',headers:securityHeaders}]}};
export default nextConfig;
