import { router, useLocalSearchParams } from 'expo-router';
import { Check, Hourglass, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { approvedBy, useFamily } from '@/state/store';
import { color, shadow, space } from '@/theme/tokens';
import { days, daysLabel, years } from '@/ui/brand';
import { Avatar, Button, Card, Glyph, Group, Money, NavBar, Progress, Row, Screen, SectionLabel, T } from '@/ui/kit';

/** One child: savings, goal, and today's tasks with their state. Editing reuses the setup screens. */
export default function Kid() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useFamily((s) => s.children.find((x) => x.id === id));
  const redeem = useFamily((s) => s.redeemGoal);
  if (!c) return null;
  const perDay = c.tasks.reduce((a, t) => a + t.reward, 0);
  const eta = c.goal && perDay ? Math.ceil(Math.max(0, c.goal.amount - c.balance) / perDay) : 0;
  return (
    <Screen>
      <NavBar />
      <View style={{ alignItems: 'center', gap: space.xs }}>
        <Avatar avatar={c.avatar} photo={c.photo} size={88} ring={color.gold} />
        <T v="title" style={{ marginTop: space.s }}>{c.name}</T>
        <T v="footnote" c={color.text2}>{years(c.age)}</T>
      </View>
      {c.goal ? (
        <LinearGradient colors={['#1D3A66', color.navy, '#060F1F']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={st.goal}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Glyph name={c.goal.icon} size={64} tone="gold" />
            <View style={{ flex: 1 }}>
              <T v="footnote" c={color.navy300}>{`هدف ${c.name}`}</T>
              <T v="title" c={color.white}>{c.goal.name}</T>
            </View>
          </View>
          <View style={{ marginTop: space.l }}>
            <T v="footnote" c={color.navy300}>جمع بمكمورته</T>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <Money n={c.balance} v="hero" c={color.white} />
              <View style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T v="headline" c={color.navy300}>من</T><Money n={c.goal.amount} v="headline" c={color.navy300} />
              </View>
            </View>
          </View>
          <View style={{ marginTop: space.m }}><Progress value={c.balance / c.goal.amount} height={12} track="rgba(255,255,255,0.14)" /></View>
          <T v="subhead" c={color.navy300} style={{ marginTop: space.s }}>
            {eta ? `باقي ${Math.ceil(c.goal.amount - c.balance)}. إذا كمّل هيك، بيوصل خلال ${days(eta)} تقريباً` : 'وصل لهدفه!'}
          </T>
          {c.balance >= c.goal.amount ? (
            <Button kind="primary" title={`اشتريناله ${c.goal.name}`} style={{ marginTop: space.l }} onPress={() => redeem(c.id)} />
          ) : null}
        </LinearGradient>
      ) : (
        <Card style={{ marginTop: space.xl, gap: space.m, alignItems: 'center' }}>
          <Glyph name="gift" size={56} tone="soft" />
          <T v="headline">{`${c.name} لسا ما عنده هدف`}</T>
          <T v="subhead" c={color.text2}>{`جمع بمكمورته ${c.balance}`}</T>
          <Button small kind="primary" title="حدّد هدف" onPress={() => router.push({ pathname: '/setup/[id]/goal', params: { id: c.id, edit: '1' } })} />
        </Card>
      )}

      <SectionLabel>مهام اليوم</SectionLabel>
      <Group>
        {c.tasks.map((t) => {
          const s = c.today[t.id]?.state ?? 'todo';
          return (
            <Row key={t.id} lead={<Glyph name={t.icon} />} title={t.name} sub={s === 'done' ? <T v="footnote" c={color.successText}>{approvedBy(c.today[t.id]?.by)}</T> : daysLabel(t.days)}
              end={s === 'done' ? <Check size={20} color={color.success} strokeWidth={3} /> : s === 'waiting' ? <Hourglass size={18} color={color.gold700} /> : <Money n={t.reward} v="subhead" c={color.text2} />} />
          );
        })}
      </Group>
      <View style={{ gap: space.s, marginTop: space.xl }}>
        <Button kind="tinted" title="تعديل المهام" icon={<Pencil size={16} color={color.navy} />} onPress={() => router.push({ pathname: '/setup/[id]/tasks', params: { id: c.id, edit: '1' } })} />
        <Button kind="tinted" title="تعديل المكافآت" onPress={() => router.push({ pathname: '/setup/[id]/rewards', params: { id: c.id, edit: '1' } })} />
        <Button kind="tinted" title="تعديل الهدف" onPress={() => router.push({ pathname: '/setup/[id]/goal', params: { id: c.id, edit: '1' } })} />
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  goal: { marginTop: space.xl, borderRadius: 26, padding: space.l, ...shadow.e2 },
});
