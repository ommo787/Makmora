import { router, useLocalSearchParams } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { signInWithApple, signInWithEmail, signInWithGoogle, type SignedIn } from '@/services/auth';
import { useFamily } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { Button, Field, NavBar, Screen, T, Title } from '@/ui/kit';

const AppleMark = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24"><Path fill="#fff" d="M16.37 1.43c0 1.14-.49 2.27-1.18 3.08-.74.9-1.99 1.57-2.99 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.57-2.27 1.21-2.98.8-.94 2.14-1.64 3.25-1.68.03.13.05.28.05.43zm4.56 15.71c-.03.07-.46 1.58-1.52 3.12-.94 1.34-1.94 2.71-3.43 2.71-1.52 0-1.9-.88-3.63-.88-1.7 0-2.3.91-3.67.91-1.38 0-2.33-1.26-3.43-2.8-1.29-1.82-2.32-4.63-2.32-7.28 0-4.28 2.8-6.55 5.55-6.55 1.45 0 2.68.95 3.6.95.87 0 2.22-1.01 3.9-1.01.61 0 2.89.06 4.37 2.19-.13.09-2.38 1.37-2.38 4.19 0 3.26 2.85 4.42 2.96 4.45z" /></Svg>
);
const GoogleMark = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <Path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <Path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <Path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </Svg>
);

const okEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

export default function Account() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const login = mode === 'login';
  const [email, setEmail] = useState(false);
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const onboarded = useFamily((s) => s.onboarded);

  const done = (r: SignedIn | null) => {
    if (!r) return;
    if (login && onboarded) return router.replace('/today');
    router.push({ pathname: '/about', params: { name: r.name ?? '', email: r.email ?? '', via: r.via } });
  };
  return (
    <Screen footer={<T v="caption" c={color.text2} center>بالمتابعة بتوافق على الشروط وسياسة الخصوصية</T>}>
      <NavBar />
      <Title sub={login ? 'أهلاً من جديد.' : 'بثواني، وبدون ما تتذكّر كلمة سر.'}>{login ? 'تسجيل الدخول' : 'أنشئ حسابك'}</Title>
      <View style={{ gap: space.s + 2, marginTop: space.xxl }}>
        <Button kind="apple" title="متابعة مع Apple" icon={<AppleMark />} onPress={async () => done(await signInWithApple())} />
        <Button kind="glass" title="متابعة مع Google" icon={<GoogleMark />} onPress={async () => done(await signInWithGoogle())} />
        {!email ? (
          <Button kind="glass" title="متابعة بالبريد" icon={<Mail size={18} color={color.navy} />} onPress={() => setEmail(true)} />
        ) : (
          <View style={{ gap: space.s, marginTop: space.s }}>
            <Field label="البريد" value={mail} onChangeText={setMail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="name@email.com" autoFocus />
            <Field label="كلمة السر" value={pass} onChangeText={setPass} secureTextEntry autoComplete={login ? 'current-password' : 'new-password'} placeholder={login ? 'مطلوبة' : '8 أحرف على الأقل'} />
            <Button title="متابعة" disabled={!okEmail(mail) || pass.length < (login ? 1 : 8)} onPress={async () => done(await signInWithEmail(mail, pass))} style={{ marginTop: space.s }} />
            {login ? <Button kind="plain" title="نسيت كلمة السر؟" /> : null}
          </View>
        )}
      </View>
    </Screen>
  );
}
