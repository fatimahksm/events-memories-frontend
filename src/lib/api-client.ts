import { appConfig } from '@/config/app-config';
export class ApiError extends Error { constructor(public readonly code:string,message:string,public readonly status:number){super(message);} }
export async function apiFetch<T>(path:string,init?:RequestInit):Promise<T>{
 const headers=new Headers(init?.headers);
 if(init?.body&&!(init.body instanceof FormData)&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),appConfig.requestTimeoutMs);
 let response:Response;
 try{response=await fetch(`${appConfig.apiBaseUrl}${path}`,{...init,credentials:'include',headers,signal:controller.signal});}
 catch(err){
   if(err instanceof DOMException&&err.name==='AbortError')throw new ApiError('REQUEST_TIMEOUT','This is taking longer than expected. Please try again.',0);
   throw new ApiError('NETWORK_ERROR','Cannot connect to the server. Make sure the backend is running.',0);
 }
 finally{clearTimeout(timer);}
 if(!response.ok){const body=await response.json().catch(()=>null);throw new ApiError(body?.code??'UNKNOWN_ERROR',body?.message??`Request failed (${response.status})`,response.status);}
 if(response.status===204)return undefined as T;
 // Some endpoints (e.g. a bare void DELETE) return 200 with an empty body rather than 204 —
 // parsing that as JSON throws even though the request genuinely succeeded, so check first.
 const text=await response.text();
 return (text?JSON.parse(text):undefined) as T;
}
export async function publicFetch<T>(path:string):Promise<T>{return apiFetch<T>(path,{cache:'no-store'});}
export function errorMessage(error:unknown,fallback:string){return error instanceof ApiError?error.message:fallback;}
