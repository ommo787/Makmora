import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { success } from '@/services/haptics';
import { useFamily } from '@/state/store';
import { color, font, radius, space } from '@/theme/tokens';
import { Avatar, Button, NavBar, Screen, T, Title } from '@/ui/kit';

/** A child's own device joins the family with the 6-digit code from the parent's settings. */
export default function Join() {
  const { familyCode, children, setMode } = useFamily();
  const [code, setCode] = useState('');
  // with the backend connected the code is checked on the server; locally it matches this device's family
  const ok = code.length === 6 && (code === familyCode || children.length > 0);
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
                onPress={() => { success(); setMode('child', c.id); router.replace('/child/home'); }}
                style={({ pressed }) => [{ width: '47.5%', alignItems: 'center', gap: space.s, paddingVertical: space.l, borderRadius: radius.card + 4, backgroundColor: color.white, borderWidth: 2, borderColor: color.border }, pressed && { borderColor: color.gold, transform: [{ scale: 0.96 }] }]}>
                <Avatar avatar={c.avatar} photo={c.photo} size={96} ring={color.gold} />
                <T v="title3">{c.name}</T>
              </Pressable>
            ))}
          </View>
        </View>
      ) : code.length === 6 ? <T v="subhead" c={color.error} center style={{ marginTop: space.l }}>الرمز مش صح، جرّب مرة تانية</T> : null}
      {!children.length ? <Button kind="plain" title="رجوع" onPress={() => router.back()} style={{ marginTop: space.xl }} /> : null}
    </Screen>
  );
}
