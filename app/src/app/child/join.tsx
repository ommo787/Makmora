import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { useFamily } from '@/state/store';
import { color, font, radius, space } from '@/theme/tokens';
import { Avatar, Button, Group, NavBar, Row, Screen, T, Title } from '@/ui/kit';

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
          <Group>
            {children.map((c) => (
              <Row key={c.id} minHeight={72} lead={<Avatar avatar={c.avatar} photo={c.photo} size={56} />} title={<T v="title3">{c.name}</T>}
                onPress={() => { setMode('child', c.id); router.replace('/child/home'); }} />
            ))}
          </Group>
        </View>
      ) : code.length === 6 ? <T v="subhead" c={color.error} center style={{ marginTop: space.l }}>الرمز مش صح، جرّب مرة تانية</T> : null}
      {!children.length ? <Button kind="plain" title="رجوع" onPress={() => router.back()} style={{ marginTop: space.xl }} /> : null}
    </Screen>
  );
}
