import { useLocalSearchParams } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { iconForGoal } from '@/data/catalog';
import { deviceCurrency, fmt } from '@/services/money';
import { perDay, useFamily } from '@/state/store';
import { color, font, space } from '@/theme/tokens';
import { days } from '@/ui/brand';
import { Button, Card, Field, Glyph, RiyalSign, Screen, T, Title } from '@/ui/kit';
import { SetupHeader, useSetup } from '@/ui/setup';

export default function Goal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child, progress, go, nextChild, editing } = useSetup(id, 'goal');
  const setGoal = useFamily((s) => s.setGoal);
  if (!child) return null;
  const g = child.goal;
  const named = !!g?.name.trim();
  const eta = g && perDay(child) ? Math.ceil(g.amount / perDay(child)) : 0;
  const setName = (name: string) => setGoal(child.id, name ? { name, icon: iconForGoal(name), amount: g?.amount ?? 100 } : undefined);
  const setAmount = (n: number) => g && setGoal(child.id, { ...g, amount: Math.max(1, n) });
  return (
    <Screen footer={<View style={{ gap: space.xs }}>
      <Button title={editing ? 'تم' : !named ? 'تخطّى هلأ' : nextChild ? `التالي: ${nextChild.name}` : 'خلصنا'} onPress={go} />
      {!named ? <T v="footnote" c={color.text2} center>{`فيك تحدده بعدين مع ${child.name}`}</T> : null}
    </View>}>
      <SetupHeader progress={progress} childId={id} editing={editing} />
      <Title sub={`شي بيطمح يوصله. اكتبه متل ما بيحكيه ${child.name}.`}>{`هدف ${child.name}`}</Title>
      <Field value={g?.name ?? ''} onChangeText={setName} placeholder="مثلاً: بلاي ستيشن، دراجة، رحلة" style={{ marginTop: space.xl }}
        lead={<Glyph name={g?.icon ?? 'gift'} size={36} tone={named ? 'gold' : 'navy'} />} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.s, marginHorizontal: space.l }}>
        <Sparkles size={13} color={color.gold700} /><T v="caption" c={color.text2}>بنختار الأيقونة حسب الاسم</T>
      </View>
      {named && g ? (
        <Card style={{ marginTop: space.xl, alignItems: 'center', gap: space.s, paddingVertical: space.xl }}>
          <T v="subhead" c={color.text2}>بيحتاج يجمع</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Pressable accessibilityLabel="أقل" onPress={() => setAmount(g.amount - 10)} style={round}><T v="title">−</T></Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TextInput value={fmt(g.amount)} keyboardType="decimal-pad" onChangeText={(t) => { const n = parseFloat(t); setAmount(isNaN(n) ? 1 : n); }}
              style={{ fontFamily: font.bold, fontSize: 44, color: color.text, width: 96, minWidth: 0, textAlign: 'center' }} />
              {deviceCurrency().code === 'SAR' ? <RiyalSign size={30} /> : <T v="title">{deviceCurrency().symbol}</T>}
            </View>
            <Pressable accessibilityLabel="أكتر" onPress={() => setAmount(g.amount + 10)} style={round}><T v="title">+</T></Pressable>
          </View>
          {eta ? <T v="subhead" c={color.text2} center>{`إذا خلّص كل مهامه، بيوصل خلال ${days(eta)} تقريباً`}</T> : null}
        </Card>
      ) : null}
    </Screen>
  );
}
const round = { width: 46, height: 46, borderRadius: 23, backgroundColor: color.navy50, alignItems: 'center' as const, justifyContent: 'center' as const };
