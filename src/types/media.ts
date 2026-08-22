export type MediaItem={id:string;mediaType:'IMAGE'|'VIDEO';mimeType:string;visibility:'PUBLIC'|'PRIVATE';guestName?:string|null;status:string;url?:string|null;thumbnailUrl?:string|null;renditionUrl?:string|null;likes:number;createdAt:string};
export type MediaPage={items:MediaItem[];nextCursor?:string|null;hasMore?:boolean;page?:number;size?:number;totalElements?:number;totalPages?:number};
export type Wish={id:string;guestName?:string|null;message:string;createdAt:string};
