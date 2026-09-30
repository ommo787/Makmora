import {
  IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold, useFonts,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, I18nManager, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initPurchases } from '@/services/purchases';
import { useFamily } from '@/state/store';
import { color } from '@/theme/tokens';
import { ToastHost } from '@/ui/toast';

// Arabic first: the whole app reads right to left (native also sets this through expo-localization in app.json).
if (Platform.OS !== 'web' && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold });
  useEffect(() => { initPurchases(); }, []);
  // A new day starts at local midnight: check after loading, when the app comes back, and once a minute.
  useEffect(() => {
    const roll = () => { if (useFamily.persist.hasHydrated()) useFamily.getState().rollover(); };
    roll();
    const offH = useFamily.persist.onFinishHydration(roll);
    const sub = AppState.addEventListener('change', (st) => st === 'active' && roll());
    const timer = setInterval(roll, 60e3);
    return () => { offH(); sub.remove(); clearInterval(timer); };
  }, []);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.mist } }}>
        <Stack.Screen name="child/home" options={{ gestureEnabled: false }} />
      </Stack>
      <ToastHost />
    </SafeAreaProvider>
  );
}
