import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

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
      return { name: name || undefined, email: c.email ?? undefined, via: 'apple' };
    } catch {
      return null; // cancelled
    }
  }
  return { name: 'أحمد الخطيب', email: 'ahmad@icloud.com', via: 'apple' };
}

export async function signInWithGoogle(): Promise<SignedIn | null> {
  return { name: 'أحمد الخطيب', email: 'ahmad@gmail.com', via: 'google' };
}

export async function signInWithEmail(email: string, _password: string): Promise<SignedIn | null> {
  return { email, via: 'email' };
}
