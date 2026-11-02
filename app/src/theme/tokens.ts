/**
 * Makmoura design tokens, from the Salimfy Brand Guidelines 3.0.
 * Deep Blue is the structure, Navy is text and depth, gold is the one focal accent (primary action, money, goals).
 * Never gold text on white and never white text on gold.
 */
export const color = {
  deepBlue: '#1D3A66',
  navy: '#0B1A32',
  navy500: '#56657E',
  navy300: '#A7B1C3',

  gold: '#ECAC4E',
  sand: '#F1E6D4',
  goldText: '#7A5A2B',

  white: '#FFFFFF',
  mist: '#F5F6F8',
  border: '#DEE1E7',
  text: '#0B1A32',
  text2: '#56657E',
  text3: '#A7B1C3',
  link: '#1F5F95',

  success: '#2E9C8F',
  successBg: '#E3F2EF',
  successText: '#1E6B62',
  error: '#A8432C',
  errorBg: '#FBE7E2',
  errorText: '#A8432C',
  scrim: 'rgba(11,26,50,0.35)',
} as const;

export const font = {
  light: 'Alexandria_300Light',
  regular: 'Alexandria_400Regular',
  medium: 'Alexandria_500Medium',
} as const;

/** Type scale (Alexandria: headlines Medium, subtitles Regular, body Light, no negative tracking). */
export const type = {
  hero: { fontFamily: font.medium, fontSize: 52, lineHeight: 64 },
  largeTitle: { fontFamily: font.medium, fontSize: 32, lineHeight: 44 },
  title: { fontFamily: font.medium, fontSize: 24, lineHeight: 34 },
  title3: { fontFamily: font.medium, fontSize: 20, lineHeight: 30 },
  headline: { fontFamily: font.medium, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: font.light, fontSize: 17, lineHeight: 27 },
  callout: { fontFamily: font.light, fontSize: 16, lineHeight: 25 },
  subhead: { fontFamily: font.light, fontSize: 15, lineHeight: 23 },
  footnote: { fontFamily: font.regular, fontSize: 13, lineHeight: 20 },
  caption: { fontFamily: font.regular, fontSize: 12, lineHeight: 17 },
} as const;

/** 8-pt spacing. */
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { tag: 6, input: 10, tile: 14, card: 20, sheet: 32, pill: 999 } as const;

/** Soft, navy-tinted elevation. */
export const shadow = {
  e1: { shadowColor: color.navy, shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  e2: { shadowColor: color.navy, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  e3: { shadowColor: color.navy, shadowOpacity: 0.14, shadowRadius: 30, shadowOffset: { width: 0, height: 24 }, elevation: 8 },
} as const;

/** Screen gutter. */
export const GUTTER = 20;
