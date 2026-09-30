import { router, useLocalSearchParams } from 'expo-router';
import { HandHeart } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { pickPhoto } from '@/services/photo';
import { online } from '@/services/supabase';
import { ensureFamily, joinAsParent } from '@/services/sync';
import { useFamily, type Parent } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Button, Field, NavBar, Screen, Sheet, T, Title } from '@/ui/kit';

/**
 * Who is this parent. Two ways in:
 * a new family (the default), or joining the family the other parent already made (invite link or code).
 */
export default function About() {
  const p = useLocalSearchParams<{ name?: string; email?: string; via?: Parent['via'] }>();
  const { setParent, invite: pending } = useFamily();
  const [name, setName] = useState(p.name ?? '');
  const [role, setRole] = useState<Parent['role'] | null>(pending?.role ?? null);
  const [photo, setPhoto] = useState<string | undefined>();
  const [join, setJoin] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const me = (): Parent => ({ name: name.trim(), role: role!, avatar: role === 'ماما' ? 'woman' : 'man', photo, email: p.email, via: p.via });

  /** Join the other parent's family: straight to today's approvals, no setup. */
  const joinFamily = async (c: string) => {
    setErr(''); setBusy(true);
    setParent(me());
    try {
      await joinAsParent(c, role!);
    } catch {
      setErr('الدعوة مش صحيحة، أو ما في إنترنت. اطلب رابط جديد.');
      setBusy(false);
      return;
    }
    useFamily.setState({ onboarded: true, mode: 'parent', invite: undefined });
    setJoin(false);
    router.replace('/today');
  };
  const next = () => {
    if (pending) return joinFamily(pending.code);
    setParent(me());
    ensureFamily();                 // with the server: make the family now (quietly retried later if offline)
    router.push('/children');
  };
  const ready = !!name.trim() && !!role;

  return (
    <Screen footer={<View style={{ gap: space.s }}>
      <Button title={pending ? 'انضم للعيلة' : 'التالي'} disabled={!ready || busy} onPress={next} />
      {err && !join ? <T v="subhead" c={color.error} center>{err}</T> : null}
    </View>}>
      <NavBar />
      <Title sub={p.name ? 'جبنا اسمك من حسابك، فيك تعدّله.' : 'شو اسمك؟'}>عرّفنا عليك</Title>

      {online() && !pending ? (
        <Pressable onPress={() => setJoin(true)} accessibilityRole="button"
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: space.m, marginTop: space.l, padding: space.l, borderRadius: radius.card, backgroundColor: color.gold50, borderWidth: 1, borderColor: color.gold300 }, pressed && { opacity: 0.85 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' }}><HandHeart size={20} color={color.gold} /></View>
          <View style={{ flex: 1 }}>
            <T v="headline">زوجك أو زوجتك عمل العيلة قبلك؟</T>
            <T v="footnote" c={color.text2}>اكبس هون وانضم لعيلتكم، بدل ما تعمل وحدة جديدة.</T>
          </View>
        </Pressable>
      ) : null}

      <Pressable accessibilityRole="button" accessibilityLabel="إضافة صورة" onPress={async () => { const x = await pickPhoto(); if (x) setPhoto(x); }}
        style={{ alignItems: 'center', marginTop: space.xl }}>
        <Avatar avatar={role === 'ماما' ? 'woman' : 'man'} photo={photo} size={104} />
        <T v="subhead" c={color.link} style={{ marginTop: space.s }}>{photo ? 'تغيير الصورة' : 'إضافة صورة'}</T>
      </Pressable>
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

      <Sheet open={join} onClose={() => setJoin(false)} title="انضم لعيلتك">
        <T v="subhead" c={color.text2} style={{ marginBottom: space.m }}>
          الأسهل: اطلب من زوجك أو زوجتك يبعتلك «رابط الدعوة» من الإعدادات، وافتحه. أو اكتب رمز الدعوة هون (8 أحرف):
        </T>
        <Field value={code} onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} placeholder="ABCD2345" autoCapitalize="characters" />
        {err ? <T v="subhead" c={color.error} center style={{ marginTop: space.s }}>{err}</T> : null}
        <Button title="انضم للعيلة" disabled={code.length !== 8 || !ready || busy} style={{ marginTop: space.l }} onPress={() => joinFamily(code)} />
        {!ready ? <T v="footnote" c={color.text2} center style={{ marginTop: space.s }}>اكتب اسمك واختار بابا أو ماما أول.</T> : null}
      </Sheet>
    </Screen>
  );
}
