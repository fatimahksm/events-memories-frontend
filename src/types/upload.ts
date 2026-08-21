export type MediaVisibility='PUBLIC'|'PRIVATE';
export type UploadState='idle'|'requesting'|'uploading'|'processing'|'success'|'error';
export type SelectedUploadFile={id:string;file:File;previewUrl?:string;progress:number;state:UploadState;error?:string};
