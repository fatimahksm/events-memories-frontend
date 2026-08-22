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
const backendOrigin=process.env.BACKEND_ORIGIN||'http://localhost:8080';
const nextConfig:NextConfig={...(process.env.VERCEL?{}:{output:'standalone'}),images:{remotePatterns:[{protocol:'https',hostname:'**'}]},async headers(){return[{source:'/(.*)',headers:securityHeaders}]},
 // The frontend and backend live on different domains, so a cookie set by the backend
 // is a cross-site cookie — Safari (and increasingly other browsers) blocks those outright
 // regardless of SameSite/Secure. Proxying /api/* through the frontend's own origin makes
 // every request same-origin from the browser's point of view, so the auth cookie is a
 // normal first-party cookie.
 async rewrites(){return[{source:'/api/:path*',destination:`${backendOrigin}/api/:path*`}];}};
export default nextConfig;
