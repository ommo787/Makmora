import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { WEEKDAYS } from '@/data/catalog';
import { perDay, useFamily, type Task } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';
import { daysLabel, SCHOOL } from '@/ui/brand';
import { Button, Glyph, Group, Money, Row, Screen, Sheet, Stepper, T, Title } from '@/ui/kit';
import { SetupHeader, useSetup } from '@/ui/setup';


export default function Rewards() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child, progress, go, editing } = useSetup(id, 'rewards');
  const updateTask = useFamily((s) => s.updateTask);
  const [edit, setEdit] = useState<Task | null>(null);
  if (!child) return null;
  const cur = edit ? child.tasks.find((t) => t.id === edit.id) : undefined;
  return (
    <Screen footer={<Button title={editing ? 'تم' : 'التالي'} onPress={go} />}>
      <SetupHeader progress={progress} childId={id} editing={editing} />
      <Title sub={`هاد المبلغ بينزل بمكمورة ${child.name} لما توافق على المهمة.`}>مكافأة كل مهمة</Title>
      <Group style={{ marginTop: space.xl }}>
        {child.tasks.map((t) => (
          <Row key={t.id} lead={<Glyph name={t.icon} />} onPress={() => setEdit(t)}
            title={<T v="body" numberOfLines={1}>{t.name}</T>} sub={<T v="footnote" c={color.link}>{daysLabel(t.days)}</T>}
            end={<Stepper value={t.reward} onChange={(n) => updateTask(child.id, t.id, { reward: n })} />} />
        ))}
      </Group>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: space.l }}>
        <T v="subhead" c={color.text2}>بيقدر يجمع لحد</T><Money n={perDay(child)} v="headline" /><T v="subhead" c={color.text2}>باليوم</T>
      </View>

      <Sheet open={!!cur} onClose={() => setEdit(null)} title={cur?.name} done="تم">
        {cur ? (
          <View style={{ gap: space.l, paddingBottom: space.s }}>
            <T v="footnote" c={color.text2} style={{ marginHorizontal: space.s }}>بأي أيام؟</T>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {WEEKDAYS.map((d, j) => (
                <Pressable key={d} onPress={() => { const n = [...cur.days]; n[j] = !n[j]; if (n.some(Boolean)) updateTask(child.id, cur.id, { days: n }); }}
                  style={{ flex: 1, height: 46, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center', backgroundColor: cur.days[j] ? color.navy : color.white }}>
                  <T v="caption" c={cur.days[j] ? color.white : color.text}>{d}</T>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: space.s }}>
              <Button small kind={cur.days.every(Boolean) ? 'secondary' : 'tinted'} title="كل يوم" style={{ flex: 1 }} onPress={() => updateTask(child.id, cur.id, { days: Array(7).fill(true) })} />
              <Button small kind={cur.days.join() === SCHOOL.join() ? 'secondary' : 'tinted'} title="أيام المدرسة" style={{ flex: 1 }} onPress={() => updateTask(child.id, cur.id, { days: [...SCHOOL] })} />
            </View>
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
