import { BrandLogo } from '@/components/ui/BrandLogo';

export function AuthVisualPanel() {
  return <section className="auth-visual"><BrandLogo inverse/><div className="auth-visual__content"><span>BRAVA CONTROL CENTER</span><h2>Run every event.<br/>From one command center.</h2><p>Publish beautiful event experiences and take care of every client, all from one place.</p><div className="auth-metrics"><div><MetricIcon type="shield"/><strong>Protected</strong><small>Every memory kept safe</small></div><div><MetricIcon type="layers"/><strong>Unified</strong><small>All your clients, one place</small></div><div><MetricIcon type="pulse"/><strong>Live</strong><small>See it happen as it happens</small></div></div></div><small className="auth-visual__footer">A product by Brava Tech</small></section>;
}

function MetricIcon({type}:{type:'shield'|'layers'|'pulse'}){return <svg viewBox="0 0 24 24" aria-hidden="true">{type==='shield'?<path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>:type==='layers'?<path d="M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>:<path d="M2 12h4l2-7 4 14 2-7h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>}</svg>}
