import { router } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import type { AvatarKey } from '@/data/catalog';
import { useFamily } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';
import { years } from '@/ui/brand';
import { Avatar, Button, Field, Group, NavBar, Row, Screen, SectionLabel, Sheet, T, Title } from '@/ui/kit';

const LOOKS: AvatarKey[] = ['boy', 'girl', 'child'];

export default function Children() {
  const { children, addChild, removeChild } = useFamily();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState(8);
  const [look, setLook] = useState<AvatarKey>('boy');
  const firstId = children[0]?.id;
  const add = () => { addChild({ name: name.trim(), age, avatar: look }); setOpen(false); setName(''); setAge(8); };
  return (
    <Screen footer={<View style={{ gap: space.s }}>
      <Button title="التالي: المهام" disabled={!firstId} onPress={() => firstId && router.push(`/setup/${firstId}/tasks`)} />
      {!children.length ? <T v="footnote" c={color.text2} center>ضيف ولد واحد على الأقل لتكمّل</T> : null}
    </View>}>
      <NavBar />
      <Title sub="ضيفهم، وبالخطوة الجاية منجهّزلهم مهامهم.">مين أولادك؟</Title>
      <SectionLabel>الأولاد</SectionLabel>
      <Group>
        {children.map((c) => (
          <Row key={c.id} lead={<Avatar avatar={c.avatar} photo={c.photo} size={44} />} title={<T v="headline">{c.name}</T>} sub={years(c.age)}
            end={<Pressable accessibilityLabel={`حذف ${c.name}`} onPress={() => removeChild(c.id)} hitSlop={8} style={del}><X size={14} color={color.text2} strokeWidth={2.6} /></Pressable>} />
        ))}
        <Row onPress={() => setOpen(true)} lead={<View style={plus}><Plus size={22} color={color.navy} strokeWidth={2.4} /></View>}
          title={<T v="body" c={color.link}>{children.length ? 'إضافة ولد تاني' : 'إضافة ولد'}</T>} />
      </Group>
      <T v="footnote" c={color.text2} style={{ marginTop: space.s, marginHorizontal: space.l }}>فيك تضيف أو تعدّل بعدين من الإعدادات.</T>

      <Sheet open={open} onClose={() => setOpen(false)} title="ولد جديد">
        <View style={{ alignItems: 'center', gap: space.m }}>
          <Avatar avatar={look} size={96} />
          <View style={{ flexDirection: 'row', gap: space.s }}>
            {LOOKS.map((l) => (
              <Pressable key={l} onPress={() => setLook(l)} accessibilityLabel="شكل" style={{ borderRadius: 28, borderWidth: 2, borderColor: look === l ? color.gold : 'transparent' }}>
                <Avatar avatar={l} size={48} />
              </Pressable>
            ))}
          </View>
          <T v="footnote" c={color.text2}>أو ضيف صورته من الإعدادات بعدين</T>
        </View>
        <Field label="الاسم" value={name} onChangeText={setName} placeholder="سليم" style={{ marginTop: space.l }} autoFocus />
        <T v="footnote" c={color.text2} style={{ marginTop: space.l, marginBottom: space.s, marginHorizontal: space.l }}>العمر</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s, paddingVertical: 2 }}>
          {Array.from({ length: 13 }, (_, i) => i + 3).map((a) => (
            <Pressable key={a} onPress={() => setAge(a)} style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: age === a ? color.navy : color.white }}>
              <T v="headline" c={age === a ? color.white : color.text}>{a}</T>
            </Pressable>
          ))}
        </ScrollView>
        <Button title="إضافة" disabled={!name.trim()} onPress={add} style={{ marginTop: space.xl }} />
      </Sheet>
    </Screen>
  );
}
const del = { width: 30, height: 30, borderRadius: 15, backgroundColor: color.navy50, alignItems: 'center' as const, justifyContent: 'center' as const };
const plus = { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: color.navy50, alignItems: 'center' as const, justifyContent: 'center' as const };
