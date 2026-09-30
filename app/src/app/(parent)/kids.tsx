import { router } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useFamily } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { tasksN, years } from '@/ui/brand';
import { Avatar, Card, Glyph, Money, Progress, Screen, T } from '@/ui/kit';

export default function Kids() {
  const children = useFamily((s) => s.children);
  return (
    <Screen tabs>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space.l }}>
        <T v="largeTitle">الأولاد</T>
        <Pressable accessibilityLabel="إضافة ولد" onPress={() => router.push('/children')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={22} color={color.navy} strokeWidth={2.4} />
        </Pressable>
      </View>
      <View style={{ gap: space.m, marginTop: space.l }}>
        {children.map((c) => (
          <Pressable key={c.id} onPress={() => router.push(`/kid/${c.id}`)}>
            <Card style={{ gap: space.m }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <Avatar avatar={c.avatar} photo={c.photo} size={56} />
                <View style={{ flex: 1 }}><T v="title3">{c.name}</T><T v="footnote" c={color.text2}>{`${years(c.age)} · ${tasksN(c.tasks.length)}`}</T></View>
                <View style={{ alignItems: 'flex-end' }}><T v="caption" c={color.text2}>بمكمورته</T><Money n={c.balance} v="title3" /></View>
                <ChevronLeft size={18} color={color.text3} />
              </View>
              {c.goal ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                  <Glyph name={c.goal.icon} size={32} tone="gold" />
                  <View style={{ flex: 1, gap: 6 }}>
                    <T v="footnote" c={color.text2}>{`${c.goal.name} · ${Math.round((c.balance / c.goal.amount) * 100)}%`}</T>
                    <Progress value={c.balance / c.goal.amount} height={6} />
                  </View>
                </View>
              ) : <T v="footnote" c={color.text2}>لسا ما في هدف</T>}
            </Card>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 96 }} />
    </Screen>
  );
}
