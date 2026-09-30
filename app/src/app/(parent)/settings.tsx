import { router } from 'expo-router';
import { ChevronLeft, CreditCard, Globe, LogOut, Smartphone, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Share, View } from 'react-native';

import { TRIAL_DAYS } from '@/data/catalog';
import { deviceCurrency } from '@/services/money';
import { useFamily } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { Avatar, Button, Field, Group, Row, Screen, SectionLabel, Sheet, T } from '@/ui/kit';

const Lead = ({ I }: { I: typeof CreditCard }) => (
  <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' }}><I size={18} color={color.gold} strokeWidth={2.2} /></View>
);

export default function Settings() {
  const f = useFamily();
  const [invite, setInvite] = useState(false);
  const [childPick, setChildPick] = useState(false);
  const [mail, setMail] = useState('');
  const cur = deviceCurrency();
  const trialLeft = f.subscription.startedAt ? Math.max(0, TRIAL_DAYS - Math.floor((Date.now() - f.subscription.startedAt) / 864e5)) : TRIAL_DAYS;
  const shareCode = () => Share.share({ message: `رمز عيلتنا على مكمورة: ${f.familyCode}` }).catch(() => {});
  return (
    <Screen tabs>
      <T v="largeTitle" style={{ marginTop: space.l }}>الإعدادات</T>

      <SectionLabel>العيلة</SectionLabel>
      <Group>
        <Row lead={<Avatar avatar={f.parent?.avatar ?? 'man'} size={40} />} title={<T v="headline">{f.parent?.name ?? ''}</T>} sub={`${f.parent?.role ?? ''} · إنت`} />
        {f.invitedPartner
          ? <Row lead={<Avatar avatar={f.parent?.role === 'ماما' ? 'man' : 'woman'} size={40} />} title={f.parent?.role === 'ماما' ? 'بابا' : 'ماما'} sub={f.partnerJoined ? 'نفس صلاحياتك' : <T v="footnote" c={color.gold700}>{`بعتنا دعوة لـ${f.invitedPartner}`}</T>} />
          : <Row onPress={() => setInvite(true)} lead={<Lead I={UserPlus} />} title={<T v="body" c={color.link}>{`ادعُ ${f.parent?.role === 'ماما' ? 'الأب' : 'الأم'}`}</T>} />}
        <Row onPress={() => router.push('/kids')} lead={<Lead I={UserPlus} />} title="الأولاد" sub={f.children.map((c) => c.name).join('، ')} end={<ChevronLeft size={18} color={color.text3} />} />
      </Group>

      <SectionLabel>أجهزة الأولاد</SectionLabel>
      <Group>
        <Row lead={<Lead I={Smartphone} />} title="رمز العيلة" sub="بيكتبه الولد على جهازه ليفوت على شاشته"
          end={<T v="title3" style={{ letterSpacing: 2, writingDirection: 'ltr' }}>{f.familyCode}</T>} onPress={shareCode} />
        <Row onPress={() => setChildPick(true)} lead={<Lead I={Smartphone} />} title="افتح شاشة ولد على هالجهاز" end={<ChevronLeft size={18} color={color.text3} />} />
      </Group>

      <SectionLabel>الاشتراك</SectionLabel>
      <Group>
        <Row lead={<Lead I={CreditCard} />} title="الاشتراك"
          sub={f.subscription.status === 'trial' ? `للعيلة كلها · تجربة مجانية، باقي ${trialLeft} يوم` : f.subscription.status === 'active' ? (f.subscription.plan === 'year' ? 'سنوي' : 'شهري') : 'ما في اشتراك'} />
        <Row lead={<Lead I={Globe} />} title="العملة" sub="حسب منطقة جهازك" end={<T v="headline">{cur.code}</T>} />
      </Group>

      <Button kind="danger" title="تسجيل الخروج" icon={<LogOut size={18} color={color.error} />} style={{ marginTop: space.xxl }} onPress={() => { f.reset(); router.replace('/welcome'); }} />
      <View style={{ height: 110 }} />

      <Sheet open={invite} onClose={() => setInvite(false)} title="دعوة">
        <T v="subhead" c={color.text2} style={{ marginBottom: space.m }}>رح يوصله رابط لينزّل مكمورة ويفوت على نفس العيلة. بيضيف مهام وبيوافق متلك تماماً، وما بيدفع شي.</T>
        <Field label="البريد" value={mail} onChangeText={setMail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email.com" />
        <Button title="إرسال الدعوة" disabled={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.trim())} style={{ marginTop: space.l }} onPress={() => { f.invitePartner(mail.trim()); setInvite(false); }} />
      </Sheet>
      <Sheet open={childPick} onClose={() => setChildPick(false)} title="شاشة مين؟">
        <Group>
          {f.children.map((c) => (
            <Row key={c.id} lead={<Avatar avatar={c.avatar} photo={c.photo} size={44} />} title={<T v="headline">{c.name}</T>}
              onPress={() => { setChildPick(false); f.setMode('child', c.id); router.replace('/child/home'); }} />
          ))}
        </Group>
        <T v="footnote" c={color.text2} style={{ marginTop: space.m, marginHorizontal: space.s }}>لترجع للوحة الأهل، اكبس «لوحة الأهل» تحت شاشة الولد، ومنطلب Face ID.</T>
      </Sheet>
    </Screen>
  );
}
