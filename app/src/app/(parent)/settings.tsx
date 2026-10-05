import { router } from 'expo-router';
import { ChevronLeft, CreditCard, FileText, Globe, LogOut, ShieldCheck, Smartphone, Trash2, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Share, View } from 'react-native';

import { TRIAL_DAYS } from '@/data/catalog';
import { deviceCurrency } from '@/services/money';
import { deleteAccount, signOut } from '@/services/sync';
import { WEB_URL } from '@/services/auth';
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
  const [del, setDel] = useState(false);
  const [delErr, setDelErr] = useState('');
  const [mail, setMail] = useState('');
  const cur = deviceCurrency();
  const trialLeft = f.subscription.startedAt ? Math.max(0, TRIAL_DAYS - Math.floor((Date.now() - f.subscription.startedAt) / 864e5)) : TRIAL_DAYS;
  const shareCode = () => Share.share({ message: `رمز عيلتنا على مكمورة: ${f.familyCode}` }).catch(() => {});
  return (
    <Screen tabs>
      <T v="largeTitle" style={{ marginTop: space.l }}>الإعدادات</T>

      <SectionLabel>العيلة</SectionLabel>
      <Group>
        <Row lead={<Avatar avatar={f.parent?.avatar ?? 'man'} photo={f.parent?.photo} size={40} />} title={<T v="headline">{f.parent?.name ?? ''}</T>} sub={`${f.parent?.role ?? ''} · إنت`} />
        {f.invitedPartner
          ? <Row lead={<Avatar avatar={f.parent?.role === 'ماما' ? 'man' : 'woman'} size={40} />} title={f.parent?.role === 'ماما' ? 'بابا' : 'ماما'} sub={f.partnerJoined ? 'نفس صلاحياتك' : <T v="footnote" c={color.gold700}>{f.invitedPartner === 'code' ? 'بعتنا الدعوة، ناطرين ينضم' : `بعتنا دعوة لـ${f.invitedPartner}`}</T>} />
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

      <SectionLabel>عن مكمورة</SectionLabel>
      <Group>
        <Row lead={<Lead I={ShieldCheck} />} title="سياسة الخصوصية" end={<ChevronLeft size={18} color={color.text3} />} onPress={() => Linking.openURL(`${WEB_URL.replace(/\/app$/, '')}/privacy.html`)} />
        <Row lead={<Lead I={FileText} />} title="شروط الاستخدام" end={<ChevronLeft size={18} color={color.text3} />} onPress={() => Linking.openURL(`${WEB_URL.replace(/\/app$/, '')}/terms.html`)} />
      </Group>

      <Button kind="danger" title="تسجيل الخروج" icon={<LogOut size={18} color={color.error} />} style={{ marginTop: space.xxl }} onPress={async () => { await signOut(); router.replace('/welcome'); }} />
      <Button kind="plain" title="حذف الحساب" style={{ marginTop: space.s }} onPress={() => setDel(true)} />

      <Sheet open={del} onClose={() => setDel(false)} title="حذف الحساب">
        <View style={{ alignItems: 'center', gap: space.s }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: color.errorBg, alignItems: 'center', justifyContent: 'center' }}><Trash2 size={26} color={color.error} /></View>
          <T v="title3" center>متأكد بدك تحذف حسابك؟</T>
          <T v="subhead" c={color.text2} center>
            {f.partnerJoined ? 'رح ينحذف حسابك، والعيلة بتضل عند الطرف التاني.' : 'رح ينحذف حسابك والعيلة كلها: الأولاد والمهام والمكمورة. ما فيك ترجع عنها.'}
          </T>
          {delErr ? <T v="subhead" c={color.error} center>{delErr}</T> : null}
        </View>
        <Button kind="danger" title="احذف حسابي" style={{ marginTop: space.xl }} onPress={async () => {
          setDelErr('');
          try { await deleteAccount(); } catch { setDelErr('ما زبط الحذف، تأكد من الإنترنت وجرّب مرة تانية.'); return; }
          setDel(false);
          router.replace('/welcome');
        }} />
        <Button kind="plain" title="لا، خلّيه" onPress={() => setDel(false)} />
      </Sheet>
      <View style={{ height: 110 }} />

      <Sheet open={invite} onClose={() => setInvite(false)} title="دعوة">
        {f.partnerCode ? (
          <View style={{ alignItems: 'center', gap: space.m }}>
            <T v="subhead" c={color.text2} center>{f.parent?.role === 'ماما' ? 'ابعتي الرابط للأب على واتساب. بيفتحه، وبيسجّل دخول بـ Google أو Apple، وبيصير معك بالعيلة بنفس الصلاحيات، وبدون ما يدفع شي.' : 'ابعت الرابط للأم على واتساب. بتفتحه، وبتسجّل دخول بـ Google أو Apple، وبتصير معك بالعيلة بنفس الصلاحيات، وبدون ما تدفع شي.'}</T>
            <Button title="شارك رابط الدعوة" style={{ alignSelf: 'stretch' }} onPress={() => {
              const link = `${WEB_URL}/invite?code=${f.partnerCode}&as=${encodeURIComponent((f.parent?.role === 'ماما' ? 'بابا' : 'ماما'))}`;
              Share.share({ message: `انضم لعيلتنا على مكمورة: ${link}` }).catch(() => {}); f.invitePartner('code');
            }} />
            <T v="footnote" c={color.text2} center>{`أو رمز الدعوة: ${f.partnerCode}`}</T>
          </View>
        ) : (
          <>
            <T v="subhead" c={color.text2} style={{ marginBottom: space.m }}>رح يوصله رابط لينزّل مكمورة ويفوت على نفس العيلة. بيضيف مهام وبيوافق متلك تماماً، وما بيدفع شي.</T>
            <Field label="البريد" value={mail} onChangeText={setMail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email.com" />
            <Button title="إرسال الدعوة" disabled={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.trim())} style={{ marginTop: space.l }} onPress={() => { f.invitePartner(mail.trim()); setInvite(false); }} />
          </>
        )}
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
