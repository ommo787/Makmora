import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { online } from '@/services/supabase';
import { ensureFamily, joinAsParent } from '@/services/sync';
import { useFamily, type Parent } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Button, Field, NavBar, Screen, Sheet, T, Title } from '@/ui/kit';

export default function About() {
  const p = useLocalSearchParams<{ name?: string; email?: string; via?: Parent['via'] }>();
  const [name, setName] = useState(p.name ?? '');
  const [role, setRole] = useState<Parent['role'] | null>(null);
  const setParent = useFamily((s) => s.setParent);
  const [join, setJoin] = useState(false);
  const [invite, setInvite] = useState('');
  const [jerr, setJerr] = useState('');
  const next = () => {
    setParent({ name: name.trim(), role: role!, avatar: role === 'ماما' ? 'woman' : 'man', email: p.email, via: p.via });
    ensureFamily();                 // with the server: make the family now (quietly retried later if offline)
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
      {online() ? <Button kind="plain" title="عندي رمز دعوة" style={{ marginTop: space.xl }} onPress={() => setJoin(true)} /> : null}

      <Sheet open={join} onClose={() => setJoin(false)} title="رمز الدعوة">
        <T v="subhead" c={color.text2} style={{ marginBottom: space.m }}>{`${role === 'ماما' ? 'بابا' : role === 'بابا' ? 'ماما' : 'اللي فتح الحساب'} بيلاقيه بالإعدادات، تحت «ادعُ». بتفوت على نفس العيلة، بنفس الصلاحيات.`}</T>
        <Field value={invite} onChangeText={(t) => setInvite(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} placeholder="ABCD2345" autoCapitalize="characters"
          style={{ justifyContent: 'center' }} />
        {jerr ? <T v="subhead" c={color.error} center style={{ marginTop: space.s }}>{jerr}</T> : null}
        <Button title="انضم للعيلة" disabled={invite.length !== 8 || !name.trim() || !role} style={{ marginTop: space.l }} onPress={async () => {
          setJerr('');
          setParent({ name: name.trim(), role: role!, avatar: role === 'ماما' ? 'woman' : 'man', email: p.email, via: p.via });
          try { await joinAsParent(invite, role!); } catch { setJerr('الرمز مش صح، أو ما في إنترنت.'); return; }
          useFamily.setState({ onboarded: true, mode: 'parent' });
          setJoin(false);
          router.replace('/today');
        }} />
        {!name.trim() || !role ? <T v="footnote" c={color.text2} center style={{ marginTop: space.s }}>اكتب اسمك واختار بابا أو ماما أول.</T> : null}
      </Sheet>
    </Screen>
  );
}
