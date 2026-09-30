import { getLocales } from 'expo-localization';

/** The family currency comes from the phone's region. No picker. */
export function deviceCurrency(): { code: string; symbol: string } {
  const l = getLocales()[0];
  return { code: l?.currencyCode ?? 'SAR', symbol: l?.currencySymbol ?? 'ر.س' };
}

/** Round to cents and drop trailing zeros. */
export const fmt = (n: number) => String(Math.round(n * 100) / 100);
