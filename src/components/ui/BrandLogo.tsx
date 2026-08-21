import Image from 'next/image';

export function BrandLogo({compact=false,inverse=false}:{compact?:boolean;inverse?:boolean}){
 return <span className={`brava-brand ${compact?'brava-brand--compact':''} ${inverse?'brava-brand--inverse':''}`}><span className="brava-brand__mark"><Image src="/brand/brava-logo.png" alt="Brava" width={72} height={72} priority/></span>{!compact&&<span className="brava-brand__copy"><strong>BRAVA</strong><small>Event Memories</small></span>}</span>;
}
