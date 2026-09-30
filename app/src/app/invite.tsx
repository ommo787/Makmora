import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useFamily, type Role } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { AppIcon, FromSalimfy } from '@/ui/brand';
import { Button, Screen, T } from '@/ui/kit';

/**
 * Opened from the link the other parent shared on WhatsApp: remember the invite, then sign in.
 * After signing in, the "about" screen joins this family instead of making a new one.
 */
export default function Invite() {
  const { code, as } = useLocalSearchParams<{ code?: string; as?: string }>();
  const role: Role = as === 'بابا' ? 'بابا' : 'ماما';
  useEffect(() => {
    if (code) useFamily.setState({ invite: { code: code.toUpperCase(), role } });
  }, [code, role]);
  const she = role === 'ماما';
  return (
    <Screen bg={color.white} footer={<Button title="متابعة" disabled={!code} onPress={() => router.push('/account')} />}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.m, minHeight: 480 }}>
        <AppIcon size={96} />
        <T v="largeTitle" center style={{ marginTop: space.l }}>{she ? 'أهلاً فيكِ بمكمورة' : 'أهلاً فيك بمكمورة'}</T>
        <T v="callout" c={color.text2} center>
          {code ? (she ? 'زوجك دعاكِ لعيلتكم. سجّلي دخول، وبتلاقي الأولاد ومهامهم جاهزين.' : 'زوجتك دعتك لعيلتكم. سجّل دخول، وبتلاقي الأولاد ومهامهم جاهزين.')
            : 'الرابط ناقص. اطلب رابط جديد من الإعدادات.'}
        </T>
      </View>
      <View style={{ marginBottom: space.l }}><FromSalimfy /></View>
    </Screen>
  );
}
