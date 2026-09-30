import { router } from 'expo-router';
import { Heart, ListChecks, Target } from 'lucide-react-native';
import { View } from 'react-native';

import { color, space } from '@/theme/tokens';
import { AppIcon, FromSalimfy } from '@/ui/brand';
import { Button, Screen, T } from '@/ui/kit';

const FEATURES = [
  { I: ListChecks, t: 'مهام يومية بسيطة', d: 'أولادك بيعرفوا شو عليهم اليوم بنظرة.' },
  { I: Target, t: 'أهداف بيطمحوا لها', d: 'كل مهمة بتقرّبهم خطوة من هدفهم.' },
  { I: Heart, t: 'لحظات عائلية حلوة', d: 'مفاجآت للعيلة لما ينجزوا سوا.' },
];

export default function Welcome() {
  return (
    <Screen bg={color.white}
      footer={<View style={{ gap: space.xs }}>
        <Button title="متابعة" onPress={() => router.push({ pathname: '/account', params: { mode: 'signup' } })} />
        <Button kind="plain" title="عندي حساب" onPress={() => router.push({ pathname: '/account', params: { mode: 'login' } })} />
        <Button kind="plain" title="هاد جهاز ولد؟ ادخل برمز العيلة" onPress={() => router.push('/child/join')} style={{ height: 36 }} />
      </View>}>
      <View style={{ alignItems: 'center', marginTop: 48 }}>
        <AppIcon size={104} />
        <T v="largeTitle" center style={{ marginTop: space.xl, fontSize: 36, lineHeight: 50 }}>مكمورة</T>
        <T v="callout" c={color.text2} center>مهام صغيرة، وأهداف كبيرة</T>
      </View>
      <View style={{ gap: space.xl, marginTop: 44, paddingHorizontal: space.s }}>
        {FEATURES.map(({ I, t, d }) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: space.l }}>
            <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' }}>
              <I size={24} color={color.gold} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="headline">{t}</T>
              <T v="subhead" c={color.text2}>{d}</T>
            </View>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 40 }}><FromSalimfy /></View>
    </Screen>
  );
}
