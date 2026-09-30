import { Platform } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

/**
 * Subscriptions go through the App Store and Google Play, managed by RevenueCat.
 * Set EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY and create an offering with
 * two packages ($rc_annual, $rc_monthly), each with a 14-day free trial, in App Store Connect / Play Console.
 * Without keys (web previews, local development) the calls below simulate a successful trial.
 */
const KEY = Platform.select({ ios: process.env.EXPO_PUBLIC_RC_IOS_KEY, android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY });
let configured = false;

export type Plan = 'year' | 'month';
export const PRICES: Record<Plan, { price: string; perMonth?: string }> = {
  year: { price: '$39.99', perMonth: '$3.33' },
  month: { price: '$4.99' },
};

export function initPurchases(userId?: string) {
  if (!KEY || Platform.OS === 'web' || configured) return;
  Purchases.configure({ apiKey: KEY, appUserID: userId });
  configured = true;
}

/** Local prices from the store when available. */
export async function loadPrices(): Promise<typeof PRICES> {
  if (!configured) return PRICES;
  try {
    const o = await Purchases.getOfferings();
    const a = o.current?.annual, m = o.current?.monthly;
    return {
      year: a ? { price: a.product.priceString, perMonth: a.product.pricePerMonthString ?? undefined } : PRICES.year,
      month: m ? { price: m.product.priceString } : PRICES.month,
    };
  } catch {
    return PRICES;
  }
}

/** Starts the free trial. Returns true when the store confirmed it (or in simulation). */
export async function startTrial(plan: Plan): Promise<boolean> {
  if (!configured) {
    await new Promise((r) => setTimeout(r, 900));
    return true;
  }
  try {
    const o = await Purchases.getOfferings();
    const pkg: PurchasesPackage | null | undefined = plan === 'year' ? o.current?.annual : o.current?.monthly;
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch {
    return false; // cancelled or failed
  }
}

export async function restore(): Promise<boolean> {
  if (!configured) return false;
  try {
    const info = await Purchases.restorePurchases();
    return Object.keys(info.entitlements.active).length > 0;
  } catch {
    return false;
  }
}
