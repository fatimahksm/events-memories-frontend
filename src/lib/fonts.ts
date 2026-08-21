import {
  Cairo,
  Poppins,
  Almarai,
  Markazi_Text,
  Montserrat,
  Changa,
  Cormorant_Garamond,
  El_Messiri,
  Reem_Kufi,
  Amiri,
} from 'next/font/google';

const cairo = Cairo({ subsets: ['latin', 'arabic'], weight: ['400', '600', '700'], variable: '--font-cairo', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins', display: 'swap' });
const almarai = Almarai({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-almarai', display: 'swap' });
const markazi = Markazi_Text({ subsets: ['latin', 'arabic'], weight: ['400', '600', '700'], variable: '--font-markazi', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-montserrat', display: 'swap' });
const changa = Changa({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-changa', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-cormorant', display: 'swap' });
const elMessiri = El_Messiri({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-elmessiri', display: 'swap' });
const reemKufi = Reem_Kufi({ subsets: ['latin', 'arabic'], weight: ['400', '500', '700'], variable: '--font-reemkufi', display: 'swap' });
const amiri = Amiri({ subsets: ['latin', 'arabic'], weight: ['400', '700'], variable: '--font-amiri', display: 'swap' });

/** Applied once on <html> so every --font-* variable is available wherever a theme.fontFamily string references it. */
export const fontVariables = [cairo, poppins, almarai, markazi, montserrat, changa, cormorant, elMessiri, reemKufi, amiri]
  .map((font) => font.variable)
  .join(' ');

/**
 * Every stack pairs (or is) a font with real Arabic glyph coverage, so switching the
 * preview / public page to Arabic keeps the chosen typographic style instead of
 * silently falling back to a generic system Arabic font.
 */
export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Editorial Serif', value: "Georgia, var(--font-amiri), serif" },
  { label: 'Modern Sans', value: "Inter, var(--font-cairo), sans-serif" },
  { label: 'Classic Serif', value: "'Times New Roman', var(--font-amiri), serif" },
  { label: 'Rounded Sans', value: "var(--font-poppins), var(--font-almarai), sans-serif" },
  { label: 'Warm Serif', value: "var(--font-markazi), serif" },
  { label: 'Bold Display', value: "var(--font-montserrat), var(--font-changa), sans-serif" },
  { label: 'Romantic Serif', value: "var(--font-cormorant), var(--font-elmessiri), serif" },
  { label: 'Geometric Kufi', value: "var(--font-reemkufi), sans-serif" },
];
