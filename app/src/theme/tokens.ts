/**
 * Makmoura design tokens, from the Salimfy Brand Guidelines 1.0.
 * Navy is structure and text, gold is the one focal accent (primary action, money, goals).
 * Never gold text on white and never white text on gold.
 */
export const color = {
  navy: '#0B1A32',
  navy800: '#1A2941',
  navy700: '#2A3952',
  navy500: '#56657E',
  navy300: '#A7B1C3',
  navy100: '#E6EAF1',
  navy50: '#F3F5F9',

  gold: '#ECAC4E',
  gold300: '#F2C882',
  gold100: '#FBEFD8',
  gold50: '#FDF8EE',
  gold700: '#94611B',

  white: '#FFFFFF',
  mist: '#F5F6F8',
  border: '#DEE1E7',
  text: '#0B1A32',
  text2: '#5C636E',
  text3: '#A0A6B0',
  link: '#1D52AE',

  success: '#1F9D6B',
  successBg: '#E8F7EF',
  successText: '#0E7A50',
  error: '#D64545',
  errorText: '#A92A2E',
  scrim: 'rgba(11,26,50,0.35)',
} as const;

export const font = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
} as const;

/** Type scale (Arabic: brand sizes, a little more line height, no negative tracking). */
export const type = {
  hero: { fontFamily: font.bold, fontSize: 52, lineHeight: 64 },
  largeTitle: { fontFamily: font.bold, fontSize: 32, lineHeight: 44 },
  title: { fontFamily: font.bold, fontSize: 24, lineHeight: 34 },
  title3: { fontFamily: font.semibold, fontSize: 20, lineHeight: 30 },
  headline: { fontFamily: font.semibold, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 27 },
  callout: { fontFamily: font.regular, fontSize: 16, lineHeight: 25 },
  subhead: { fontFamily: font.regular, fontSize: 15, lineHeight: 23 },
  footnote: { fontFamily: font.regular, fontSize: 13, lineHeight: 20 },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 17 },
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
