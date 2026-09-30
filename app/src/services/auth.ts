import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/services/supabase';

export type SignedIn = { name?: string; email?: string; via: 'apple' | 'google' | 'email' };
export type Provider = 'google' | 'apple';

/** Where the web version lives; invite links point here so they open on any phone. */
export const WEB_URL = 'https://ommo787.github.io/Makmora/app';

/** Which sign-in buttons work right now (the server says which providers are switched on). */
export async function providers(): Promise<Record<Provider, boolean>> {
  if (!supabase) return { google: true, apple: true };           // no server: local accounts for trying the app
  try {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY! } });
    const j = (await r.json()) as { external?: Record<string, boolean> };
    return { google: !!j.external?.google, apple: !!j.external?.apple || Platform.OS === 'ios' };
  } catch {
    return { google: true, apple: true };
  }
}

/** The signed-in user as the app needs it: a name to greet and an email to show. */
export async function currentUser(): Promise<SignedIn | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u || u.is_anonymous) return null;
  const m = u.user_metadata as { full_name?: string; name?: string };
  const via = (u.app_metadata?.provider as SignedIn['via']) ?? 'google';
  return { name: m.full_name ?? m.name, email: u.email ?? undefined, via };
}

/** Sign in with Apple: the system sheet on iPhone, Apple's page elsewhere. */
export async function signInWithApple(): Promise<SignedIn | null> {
  if (Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync())) {
    try {
      const c = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      const name = [c.fullName?.givenName, c.fullName?.familyName].filter(Boolean).join(' ');
      if (supabase && c.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: c.identityToken });
        if (error) throw new Error('ما زبط الدخول بـ Apple، جرّب مرة تانية.');
      }
      return { name: name || undefined, email: c.email ?? undefined, via: 'apple' };
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('ما زبط')) throw e;
      return null; // cancelled
    }
  }
  if (!supabase) return { name: 'أحمد الخطيب', email: 'ahmad@icloud.com', via: 'apple' };
  return oauth('apple');
}

export async function signInWithGoogle(): Promise<SignedIn | null> {
  if (!supabase) return { name: 'أحمد الخطيب', email: 'ahmad@gmail.com', via: 'google' };
  return oauth('google');
}

/**
 * Google (and Apple outside iPhone) through the provider's own page.
 * On the web the page reloads and comes back signed in, so this returns null and the account screen picks it up.
 * In the app a browser sheet opens and closes by itself.
 */
async function oauth(provider: Provider): Promise<SignedIn | null> {
  if (Platform.OS === 'web') {
    const back = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase!.auth.signInWithOAuth({ provider, options: { redirectTo: back } });
    if (error) throw new Error('ما زبط الدخول، جرّب مرة تانية.');
    return null;                                                   // the browser is leaving for the provider
  }
  const redirectTo = Linking.createURL('auth');
  const { data, error } = await supabase!.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
  if (error || !data.url) throw new Error('ما زبط الدخول، جرّب مرة تانية.');
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success') return null;                        // closed
  const u = new URL(res.url);
  const code = u.searchParams.get('code');
  if (code) {
    const r = await supabase!.auth.exchangeCodeForSession(code);
    if (r.error) throw new Error('ما زبط الدخول، جرّب مرة تانية.');
  } else {
    const h = new URLSearchParams(u.hash.slice(1));
    const access_token = h.get('access_token'), refresh_token = h.get('refresh_token');
    if (!access_token || !refresh_token) throw new Error('ما زبط الدخول، جرّب مرة تانية.');
    const r = await supabase!.auth.setSession({ access_token, refresh_token });
    if (r.error) throw new Error('ما زبط الدخول، جرّب مرة تانية.');
  }
  return currentUser();
}
