import { useLocalSearchParams } from 'expo-router';
import { Check, Plus, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { iconForTask, TASK_TEMPLATES } from '@/data/catalog';
import { templateToTask, useFamily } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { tasksN, years } from '@/ui/brand';
import { Button, Field, Glyph, Group, Row, Screen, Sheet, T, Title } from '@/ui/kit';
import { SetupHeader, useSetup } from '@/ui/setup';

export default function Tasks() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { child, progress, go, editing } = useSetup(id, 'tasks');
  const { addTask, removeTask } = useFamily();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  if (!child) return null;
  const has = new Set(child.tasks.map((t) => t.key).filter(Boolean));
  // at most 9 ready-made tasks, so writing your own stays in view
  const lib = [...TASK_TEMPLATES.filter((t) => has.has(t.key)), ...TASK_TEMPLATES.filter((t) => !has.has(t.key))].slice(0, 9);
  const toggle = (key: string) => {
    const t = child.tasks.find((x) => x.key === key);
    if (t) removeTask(child.id, t.id); else addTask(child.id, templateToTask(key));
  };
  const addOwn = () => {
    const name = draft.trim();
    addTask(child.id, { name, icon: iconForTask(name), did: name, reward: 2, days: Array(7).fill(true) });
    setDraft('');
  };
  return (
    <Screen footer={<View style={{ gap: space.xs }}>
      <Button title={editing ? 'تم' : 'التالي'} disabled={!child.tasks.length} onPress={go} />
      <T v="footnote" c={color.text2} center>{tasksN(child.tasks.length)} · فيك تغيّرهم بعدين</T>
    </View>}>
      <SetupHeader progress={progress} childId={id} editing={editing} />
      <Title sub={`جهّزنالك مهام حسب عمره (${years(child.age)}). احذف أو ضيف متل ما بدك.`}>{`مهام ${child.name} اليومية`}</Title>
      <Group style={{ marginTop: space.xl }} inset={68}>
        {child.tasks.map((t) => (
          <Row key={t.id} lead={<Glyph name={t.icon} />} title={t.name}
            end={<Pressable accessibilityLabel={`حذف ${t.name}`} hitSlop={8} onPress={() => removeTask(child.id, t.id)} style={st.del}><X size={14} color={color.text2} strokeWidth={2.6} /></Pressable>} />
        ))}
        <Row onPress={() => setOpen(true)} lead={<View style={st.plus}><Plus size={22} color={color.navy} strokeWidth={2.4} /></View>} title={<T v="body" c={color.link}>إضافة مهمة</T>} />
      </Group>

      <Sheet open={open} onClose={() => setOpen(false)} title="إضافة مهمة" done="تم">
        <T v="footnote" c={color.text2} style={{ marginBottom: space.s, marginHorizontal: space.s }}>مهام جاهزة · كبسة لتضيف</T>
        <View style={st.grid}>
          {lib.map((t) => {
            const on = has.has(t.key);
            return (
              <Pressable key={t.key} onPress={() => toggle(t.key)} accessibilityState={{ selected: on }}
                style={({ pressed }) => [st.tile, on && st.tileOn, pressed && { transform: [{ scale: 0.95 }] }]}>
                {on ? <View style={st.tick}><Check size={12} color={color.navy} strokeWidth={3.4} /></View> : null}
                <Glyph name={t.icon} size={48} />
                <T v="caption" center numberOfLines={1} style={{ fontSize: 13 }}>{t.name}</T>
                <T v="caption" c={color.gold700} style={{ fontSize: 11, opacity: on ? 1 : 0 }}>انضافت</T>
              </Pressable>
            );
          })}
        </View>
        <T v="footnote" c={color.text2} style={{ marginTop: space.l, marginBottom: space.s, marginHorizontal: space.s }}>أو اكتب مهمة جديدة</T>
        <Field value={draft} onChangeText={setDraft} placeholder="مثلاً: إطعام القطة" lead={<Glyph name={draft.trim() ? iconForTask(draft) : 'sparkles'} size={34} />} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.s, marginHorizontal: space.s }}>
          <Sparkles size={13} color={color.gold700} /><T v="caption" c={color.text2}>بنختار الأيقونة حسب الاسم</T>
        </View>
        <Button title={draft.trim() ? `إضافة «${draft.trim()}»` : 'إضافة المهمة'} disabled={!draft.trim()} onPress={addOwn} style={{ marginTop: space.l }} />
      </Sheet>
    </Screen>
  );
}
const st = StyleSheet.create({
  del: { width: 30, height: 30, borderRadius: 15, backgroundColor: color.navy50, alignItems: 'center', justifyContent: 'center' },
  plus: { width: 40, height: 40, borderRadius: 11, backgroundColor: color.navy50, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  tile: { width: '31.5%', alignItems: 'center', gap: 6, paddingTop: space.m, paddingBottom: space.s, borderRadius: radius.card, backgroundColor: color.white, borderWidth: 2, borderColor: 'transparent', ...shadow.e1 },
  tileOn: { borderColor: color.gold, backgroundColor: color.gold50 },
  tick: { position: 'absolute', top: 8, start: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: color.gold, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});
