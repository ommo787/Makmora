import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

import { perDay, useFamily } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { days, tasksN, years } from '@/ui/brand';
import { Avatar, Button, Card, Glyph, Money, NavBar, Screen, T } from '@/ui/kit';

export default function AllSet() {
  const children = useFamily((s) => s.children);
  return (
    <Screen footer={<View style={{ gap: space.xs }}>
      <Button title="اعتماد المهام" onPress={() => router.push('/setup/preview')} />
      <T v="footnote" c={color.text2} center>بتقدر تعدّل أي شي بعدين من الإعدادات</T>
    </View>}>
      <NavBar />
      <View style={{ alignItems: 'center', gap: space.s }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: color.success, alignItems: 'center', justifyContent: 'center' }}><Check size={44} color="#fff" strokeWidth={3} /></View>
        <T v="largeTitle" center style={{ marginTop: space.s }}>كل شي جاهز!</T>
        <T v="callout" c={color.text2} center>بكرة الصبح بيلاقي كل ولد مهامه ناطرته.</T>
      </View>
      {children.map((c) => {
        const eta = c.goal && perDay(c) ? Math.ceil(c.goal.amount / perDay(c)) : 0;
        return (
          <Card key={c.id} style={{ marginTop: space.xl, gap: space.m }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Avatar avatar={c.avatar} photo={c.photo} size={56} />
              <View style={{ flex: 1 }}>
                <T v="title3">{c.name}</T>
                <T v="footnote" c={color.text2}>{`${years(c.age)} · ${tasksN(c.tasks.length)} باليوم`}</T>
              </View>
              <Button small kind="tinted" title="تعديل" onPress={() => router.push(`/setup/${c.id}/tasks`)} />
            </View>
            <View style={{ gap: 2 }}>
              {c.tasks.map((t) => (
                <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: 6 }}>
                  <Glyph name={t.icon} size={34} />
                  <T v="callout" style={{ flex: 1 }}>{t.name}</T>
                  <Money n={t.reward} v="callout" />
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, backgroundColor: color.gold50, borderRadius: 16, padding: space.m }}>
              <Glyph name={c.goal?.icon ?? 'gift'} size={36} tone="gold" />
              <View style={{ flex: 1 }}>
                <T v="headline">{c.goal ? `هدفه: ${c.goal.name}` : 'لسا ما في هدف'}</T>
                {c.goal ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Money n={c.goal.amount} v="footnote" c={color.text2} />{eta ? <T v="footnote" c={color.text2}>{`· تقريباً ${days(eta)}`}</T> : null}
                  </View>
                ) : <T v="footnote" c={color.text2}>حدّدوه سوا من الصفحة الرئيسية</T>}
              </View>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
