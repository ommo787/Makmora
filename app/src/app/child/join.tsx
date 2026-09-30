import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { AvatarKey } from '@/data/catalog';
import { success } from '@/services/haptics';
import { online } from '@/services/supabase';
import { joinAsChild, peekFamily } from '@/services/sync';
import { useFamily } from '@/state/store';
import { color, font, radius, space } from '@/theme/tokens';
import { Avatar, NavBar, Screen, T, Title } from '@/ui/kit';

/** A child's own device joins the family with the 6-digit code from the parent's settings. */
type Kid = { id: string; name: string; avatar: AvatarKey; photo?: string };

export default function Join() {
  const { familyCode, children: local, setMode } = useFamily();
  const [code, setCode] = useState('');
  const [remote, setRemote] = useState<Kid[] | null>(null);
  const [err, setErr] = useState('');
  // with the server the code is checked there; without it, it matches this device's family
  useEffect(() => {
    setRemote(null); setErr('');
    if (!online() || code.length !== 6) return;
    let live = true;
    peekFamily(code)
      .then((r) => { if (live) { if (r?.length) setRemote(r.map((k) => ({ id: k.child_id, name: k.name, avatar: k.avatar as AvatarKey }))); else setErr('الرمز مش صح، جرّب مرة تانية'); } })
      .catch(() => live && setErr('ما قدرنا نوصل، تأكد من الإنترنت'));
    return () => { live = false; };
  }, [code]);
  const children: Kid[] = online() ? remote ?? [] : local;
  const ok = online() ? !!remote?.length : code.length === 6 && (code === familyCode || local.length > 0);
  const pick = async (id: string) => {
    success();
    if (online()) {
      try { await joinAsChild(code, id); } catch { setErr('ما زبط، جرّب مرة تانية'); return; }
    } else setMode('child', id);
    router.replace('/child/home');
  };
  return (
    <Screen>
      <NavBar />
      <Title sub="بابا أو ماما بيلاقوه بالإعدادات، تحت «أجهزة الأولاد».">اكتب رمز العيلة</Title>
      <TextInput value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoFocus placeholder="000000" placeholderTextColor={color.navy100}
        style={{ marginTop: space.xxl, fontFamily: font.bold, fontSize: 40, letterSpacing: 10, textAlign: 'center', backgroundColor: color.white, borderRadius: radius.card, paddingVertical: space.l, color: color.navy, writingDirection: 'ltr' }} />
      {ok && children.length ? (
        <View style={{ marginTop: space.xxl }}>
          <T v="title3" style={{ marginBottom: space.m }}>مين إنت؟</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m }}>
            {children.map((c) => (
              <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={c.name}
                onPress={() => pick(c.id)}
                style={({ pressed }) => [{ width: '47.5%', alignItems: 'center', gap: space.s, paddingVertical: space.l, borderRadius: radius.card + 4, backgroundColor: color.white, borderWidth: 2, borderColor: color.border }, pressed && { borderColor: color.gold, transform: [{ scale: 0.96 }] }]}>
                <Avatar avatar={c.avatar} photo={c.photo} size={96} ring={color.gold} />
                <T v="title3">{c.name}</T>
              </Pressable>
            ))}
          </View>
        </View>
      ) : err || (!online() && code.length === 6) ? <T v="subhead" c={color.error} center style={{ marginTop: space.l }}>{err || 'الرمز مش صح، جرّب مرة تانية'}</T> : null}
    </Screen>
  );
}
