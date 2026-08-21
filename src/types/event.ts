export type EventColorMode='LIGHT'|'DARK';
export type BackgroundFit='COVER'|'CONTAIN';
export type EventTheme={templateKey:string;backgroundImageUrl?:string|null;primaryColor:string;accentColor:string;textColor:string;overlayOpacity:number;fontFamily:string;buttonRadiusPx:number;colorMode:EventColorMode;backgroundPositionX:number;backgroundPositionY:number;backgroundFit:BackgroundFit};
export type PublicEvent={id:string;slug:string;names:string;quote?:string|null;namesAr?:string|null;quoteAr?:string|null;eventDate?:string|null;expiresAt:string;theme:EventTheme};
export type EventSummary={id:string;slug:string;names:string;quote?:string|null;namesAr?:string|null;quoteAr?:string|null;eventDate?:string|null;expiresAt:string;mediaDeleteAt:string;active:boolean;retentionStatus:'ACTIVE'|'PENDING_DELETION'|'DELETING'|'DELETION_FAILED'|'ARCHIVED';deletionAttempts:number;theme:EventTheme};
