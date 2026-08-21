'use client';
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { appConfig } from '@/config/app-config';
import { apiFetch,errorMessage,ApiError } from '@/lib/api-client';
import { validateUploadFile } from '@/lib/upload-validation';
import type { Dictionary } from '@/i18n/dictionary';
import type { MediaVisibility, SelectedUploadFile } from '@/types/upload';

const makeId=()=>crypto.randomUUID();
function getVisitorId(){let id=localStorage.getItem('eventVisitorId');if(!id){id=crypto.randomUUID();localStorage.setItem('eventVisitorId',id);}return id;}
export function UploadPanel({dictionary,eventSlug,onClose,onUploaded}:{dictionary:Dictionary;eventSlug:string;onClose:()=>void;onUploaded:()=>void}){
 const inputRef=useRef<HTMLInputElement>(null); const [guestName,setGuestName]=useState(''); const [visibility,setVisibility]=useState<MediaVisibility>('PUBLIC'); const [files,setFiles]=useState<SelectedUploadFile[]>([]); const [formError,setFormError]=useState<string>(); const [completed,setCompleted]=useState(false); const running=useRef(new Map<string,XMLHttpRequest>());
 const canUpload=useMemo(()=>files.some(f=>f.state==='idle'||f.state==='error'),[files]);
 function add(selected:File[]){setFormError(undefined);if(files.length+selected.length>appConfig.uploads.maxFilesPerUpload){setFormError(dictionary.upload.tooMany);return;}const mapped=selected.map<SelectedUploadFile>(file=>{const ve=validateUploadFile(file);return{id:makeId(),file,previewUrl:file.type.startsWith('image/')?URL.createObjectURL(file):undefined,progress:0,state:ve?'error':'idle',error:ve?dictionary.upload[ve]:undefined};});setFiles(c=>[...c,...mapped]);}
 function onSelect(e:ChangeEvent<HTMLInputElement>){add(Array.from(e.target.files??[]));e.target.value='';}
 function onDrop(e:DragEvent){e.preventDefault();add(Array.from(e.dataTransfer.files??[]));}
 function patch(id:string,data:Partial<SelectedUploadFile>){setFiles(c=>c.map(f=>f.id===id?{...f,...data}:f));}
 async function uploadOne(item:SelectedUploadFile){patch(item.id,{state:'requesting',error:undefined});try{
   const s=await retry(()=>apiFetch<{uploadUrl:string;mediaId:string}>(`/public/events/${eventSlug}/uploads/session`,{method:'POST',headers:{'X-Visitor-Id':getVisitorId()},body:JSON.stringify({clientUploadId:item.id,fileName:item.file.name,contentType:item.file.type,size:item.file.size,visibility,guestName:guestName.trim()||null})}),appConfig.uploads.maxRetries,isRetryable);
   let lastProgress=-1;
   await retry(()=>uploadWithProgress(s.uploadUrl,item.file,p=>{if(p!==lastProgress){lastProgress=p;patch(item.id,{state:'uploading',progress:p});}},xhr=>running.current.set(item.id,xhr)),appConfig.uploads.maxRetries,isRetryable);
   running.current.delete(item.id);patch(item.id,{state:'processing',progress:100});
   await retry(()=>apiFetch(`/public/events/${eventSlug}/uploads/${s.mediaId}/finalize`,{method:'POST',headers:{'X-Visitor-Id':getVisitorId()}}),appConfig.uploads.maxRetries,isRetryable);
   patch(item.id,{state:'success',progress:100});
 }catch(err){running.current.delete(item.id);patch(item.id,{state:'error',error:errorMessage(err,dictionary.upload.genericError)});}}
 async function uploadAll(){const queue=files.filter(f=>(f.state==='idle'||f.state==='error')&&!f.error);setCompleted(false);await runPool(queue,Math.max(1,appConfig.uploads.maxConcurrentUploads),uploadOne);setCompleted(true);onUploaded();}
 function remove(id:string){running.current.get(id)?.abort();running.current.delete(id);setFiles(c=>{const item=c.find(x=>x.id===id);if(item?.previewUrl)URL.revokeObjectURL(item.previewUrl);return c.filter(x=>x.id!==id)});}
 return <div className="sheet-backdrop" role="dialog" aria-modal="true" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><div className="upload-sheet">
   <button className="close-button" onClick={onClose} aria-label="Close">×</button>
   {completed&&files.length>0&&files.every(f=>f.state==='success')?<div className="upload-success"><div className="success-mark"/><h2>{dictionary.upload.successTitle}</h2><p>{dictionary.upload.successText}</p><button className="button button--dark" onClick={onClose}>{dictionary.common.open}</button></div>:<>
   <div className="sheet-heading"><span className="kicker">MEMORIES</span><h2>{dictionary.upload.title}</h2><p>{dictionary.upload.subtitle}</p></div>
   <input ref={inputRef} hidden type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={onSelect}/>
   <button className="drop-zone" onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={onDrop}><span className="drop-icon"/><strong>{dictionary.upload.choose}</strong><small>{dictionary.upload.drop}</small><em>JPG · PNG · WEBP · MP4 · MOV</em></button>
   <label className="field"><span>{dictionary.event.guestName}</span><input value={guestName} maxLength={100} onChange={e=>setGuestName(e.target.value)}/></label>
   <div className="visibility-grid">{(['PUBLIC','PRIVATE'] as const).map(v=><button key={v} type="button" className={`visibility-card ${visibility===v?'is-active':''}`} onClick={()=>setVisibility(v)}><span className="visibility-icon"/><span><strong>{v==='PUBLIC'?dictionary.event.public:dictionary.event.private}</strong><small>{v==='PUBLIC'?dictionary.event.publicHint:dictionary.event.privateHint}</small></span></button>)}</div>
   {formError&&<p className="form-error">{formError}</p>}
   <div className="upload-list">{files.map(item=><div className="upload-row" key={item.id}>{item.previewUrl?<img src={item.previewUrl} alt=""/>:<div className="video-thumb"><span/></div>}<div className="upload-row__content"><div className="file-line"><strong title={item.file.name}>{item.file.name}</strong><span>{formatBytes(item.file.size)}</span></div><div className="progress-track"><span style={{width:`${item.progress}%`}}/></div><small className={item.error?'danger':item.state==='success'?'success':''}>{item.error??(item.state==='processing'?dictionary.upload.processing:item.state==='success'?dictionary.upload.done:`${item.progress}%`)}</small></div><button className="text-button" onClick={()=>remove(item.id)}>{dictionary.upload.remove}</button></div>)}</div>
   <button className="button button--dark button--wide" disabled={!canUpload} onClick={uploadAll}>{dictionary.upload.upload}</button></>}
 </div></div>;
}
async function runPool<T>(items:T[],concurrency:number,worker:(item:T)=>Promise<void>){let next=0;async function consume(){while(true){const i=next++;if(i>=items.length)return;await worker(items[i]);}}await Promise.all(Array.from({length:Math.min(concurrency,items.length)},consume));}
async function retry<T>(fn:()=>Promise<T>,maxRetries:number,isRetryableErr:(e:unknown)=>boolean=()=>true){let last:unknown;for(let attempt=0;attempt<=maxRetries;attempt++){try{return await fn();}catch(e){last=e;if(attempt===maxRetries||!isRetryableErr(e))break;await new Promise(r=>setTimeout(r,Math.min(4000,350*2**attempt+Math.random()*250)));}}throw last;}
/** Skip retrying failures the server (or a virus/format check) has already permanently rejected — only network hiccups, timeouts, and server errors are worth another attempt. */
function isRetryable(e:unknown){if(e instanceof ApiError)return e.status===0||e.status>=500||e.status===408||e.status===429;if(e instanceof UploadHttpError)return e.status===0||e.status>=500||e.status===408||e.status===429;return true;}
class UploadHttpError extends Error{constructor(public readonly status:number,message:string){super(message);}}
function uploadWithProgress(url:string,file:File,onProgress:(p:number)=>void,onStart:(xhr:XMLHttpRequest)=>void){return new Promise<void>((resolve,reject)=>{const xhr=new XMLHttpRequest();onStart(xhr);xhr.open('PUT',url);xhr.timeout=appConfig.uploadTimeoutMs;xhr.setRequestHeader('Content-Type',file.type);xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(Math.round(e.loaded/e.total*100));};xhr.onload=()=>xhr.status>=200&&xhr.status<300?resolve():reject(new UploadHttpError(xhr.status,`Upload failed: ${xhr.status}`));xhr.onerror=()=>reject(new UploadHttpError(0,'Network error'));xhr.onabort=()=>reject(new UploadHttpError(0,'Upload cancelled'));xhr.ontimeout=()=>reject(new UploadHttpError(0,'Upload timed out'));xhr.send(file);});}
function formatBytes(b:number){return b>=1024*1024?`${(b/1024/1024).toFixed(1)} MB`:`${Math.ceil(b/1024)} KB`;}
