import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { supabase } from '@/services/supabase';

export type SignedIn = { name?: string; email?: string; via: 'apple' | 'google' | 'email' };

/**
 * Sign in with Apple on iOS. Google and email go through the backend (Supabase Auth) once it is connected;
 * until then they return a local account so the rest of the app can be used.
 */
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
    } catch {
      return null; // cancelled
    }
  }
  return { name: 'أحمد الخطيب', email: 'ahmad@icloud.com', via: 'apple' };
}

/** Google needs its own setup on the server; until then the button only shows when there is no server. */
export const googleReady = !supabase;
export async function signInWithGoogle(): Promise<SignedIn | null> {
  return { name: 'أحمد الخطيب', email: 'ahmad@gmail.com', via: 'google' };
}

/** Email and password. With the server: a real account; the family is made on the next screen. */
export async function signInWithEmail(email: string, password: string, login = false): Promise<SignedIn | null> {
  if (!supabase) return { email, via: 'email' };
  email = email.trim().toLowerCase();
  const signIn = () => supabase!.auth.signInWithPassword({ email, password });
  if (login) {
    const { error } = await signIn();
    if (error) throw new Error('البريد أو كلمة السر مش صح.');
    return { email, via: 'email' };
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // already has an account: just sign in
    if (/registered|exists/i.test(error.message)) {
      const r = await signIn();
      if (r.error) throw new Error('عندك حساب بهالبريد. اكتب كلمة السر الصح أو سجّل دخول.');
      return { email, via: 'email' };
    }
    throw new Error(/password/i.test(error.message) ? 'كلمة السر ضعيفة، جرّب وحدة أطول.' : 'ما زبط، جرّب مرة تانية.');
  }
  if (!data.session) throw new Error('بعتنالك رسالة على بريدك. افتحها لتأكد الحساب، وبعدين سجّل دخول.');
  return { email, via: 'email' };
}
