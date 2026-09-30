import { router, useLocalSearchParams } from 'expo-router';
import { Check, Hourglass, Pencil } from 'lucide-react-native';
import { View } from 'react-native';

import { useFamily } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { days, daysLabel, years } from '@/ui/brand';
import { Avatar, Button, Card, Glyph, Group, Money, NavBar, Progress, Row, Screen, SectionLabel, T } from '@/ui/kit';

/** One child: savings, goal, and today's tasks with their state. Editing reuses the setup screens. */
export default function Kid() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useFamily((s) => s.children.find((x) => x.id === id));
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
      <Card style={{ marginTop: space.xl, backgroundColor: color.navy, gap: space.m }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="subhead" c={color.navy300}>بمكمورته</T><Money n={c.balance} v="title" c={color.white} />
        </View>
        {c.goal ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Glyph name={c.goal.icon} size={40} tone="gold" />
              <View style={{ flex: 1 }}><T v="headline" c={color.white}>{c.goal.name}</T>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><T v="footnote" c={color.navy300}>الهدف</T><Money n={c.goal.amount} v="footnote" c={color.navy300} /></View></View>
            </View>
            <Progress value={c.balance / c.goal.amount} height={10} track="rgba(255,255,255,0.14)" />
            <T v="footnote" c={color.navy300}>{eta ? `إذا كمّل هيك، بيوصل خلال ${days(eta)} تقريباً` : 'وصل لهدفه!'}</T>
          </>
        ) : <Button small kind="primary" title="حدّد هدف" onPress={() => router.push({ pathname: '/setup/[id]/goal', params: { id: c.id, edit: '1' } })} />}
      </Card>

      <SectionLabel>مهام اليوم</SectionLabel>
      <Group>
        {c.tasks.map((t) => {
          const s = c.today[t.id]?.state ?? 'todo';
          return (
            <Row key={t.id} lead={<Glyph name={t.icon} />} title={t.name} sub={daysLabel(t.days)}
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
