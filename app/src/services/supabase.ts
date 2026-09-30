import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

/**
 * The family's server. The publishable key is public by design (it ships inside every app);
 * what protects each family is Row Level Security on the server (see supabase/migrations).
 * Without these two values the app runs on this device only, as before.
 */
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// web pages are also pre-rendered on the build machine, where there is no browser storage: no client there
const prerender = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase: SupabaseClient | null = URL && KEY && !prerender
  ? createClient(URL, KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  })
  : null;

export const online = () => !!supabase;
