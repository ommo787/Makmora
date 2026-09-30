import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useFamily, type Parent } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Button, Field, NavBar, Screen, T, Title } from '@/ui/kit';

export default function About() {
  const p = useLocalSearchParams<{ name?: string; email?: string; via?: Parent['via'] }>();
  const [name, setName] = useState(p.name ?? '');
  const [role, setRole] = useState<Parent['role'] | null>(null);
  const setParent = useFamily((s) => s.setParent);
  const next = () => {
    setParent({ name: name.trim(), role: role!, avatar: role === 'ماما' ? 'woman' : 'man', email: p.email, via: p.via });
    router.push('/children');
  };
  return (
    <Screen footer={<Button title="التالي" disabled={!name.trim() || !role} onPress={next} />}>
      <NavBar />
      <Title sub={p.name ? 'جبنا اسمك من حسابك، فيك تعدّله.' : 'شو اسمك؟'}>عرّفنا عليك</Title>
      <View style={{ alignItems: 'center', marginTop: space.xxl }}>
        <Avatar avatar={role === 'ماما' ? 'woman' : role === 'بابا' ? 'man' : undefined} size={104} />
        <T v="subhead" c={color.link} style={{ marginTop: space.s }}>إضافة صورة</T>
      </View>
      <Field label="الاسم" value={name} onChangeText={setName} placeholder="اسمك" style={{ marginTop: space.xl }} />
      <T v="footnote" c={color.text2} style={{ marginTop: space.xxl, marginBottom: space.s, marginHorizontal: space.l }}>الأولاد بينادوك</T>
      <View style={{ flexDirection: 'row', gap: space.m }}>
        {(['بابا', 'ماما'] as const).map((r) => (
          <Pressable key={r} accessibilityRole="radio" accessibilityState={{ selected: role === r }} onPress={() => setRole(r)}
            style={{ flex: 1, alignItems: 'center', gap: space.s, paddingVertical: space.l, borderRadius: radius.card, backgroundColor: color.white, borderWidth: 2, borderColor: role === r ? color.gold : 'transparent', ...shadow.e1 }}>
            <Avatar avatar={r === 'بابا' ? 'man' : 'woman'} size={60} />
            <T v="headline">{r}</T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
