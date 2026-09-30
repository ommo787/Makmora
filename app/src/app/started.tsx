import { router } from 'expo-router';
import { Check, HandHeart } from 'lucide-react-native';
import { useState } from 'react';
import { Share, View } from 'react-native';

import { TRIAL_DAYS } from '@/data/catalog';
import { useFamily } from '@/state/store';
import { color, space } from '@/theme/tokens';
import { Button, Card, Field, Screen, Sheet, T } from '@/ui/kit';

const okEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

export default function Started() {
  const { invitedPartner, invitePartner, parent, partnerCode } = useFamily();
  const [open, setOpen] = useState(false);
  const [mail, setMail] = useState('');
  const other = parent?.role === 'ماما' ? 'الأب' : 'الأم';
  return (
    <Screen bg={color.white} footer={<Button title="للصفحة الرئيسية" onPress={() => router.replace('/today')} />}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.s, minHeight: 420 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: color.success, alignItems: 'center', justifyContent: 'center' }}><Check size={50} color="#fff" strokeWidth={3} /></View>
        <T v="largeTitle" center style={{ marginTop: space.l }}>تجربتك بلّشت!</T>
        <T v="callout" c={color.text2} center>{`عندك ${TRIAL_DAYS} يوم مجاناً، ومنذكّرك قبل ما تخلص بيومين.`}</T>
        <Card style={{ marginTop: space.xxl, flexDirection: 'row', alignItems: 'center', gap: space.m, alignSelf: 'stretch', backgroundColor: color.mist }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' }}><HandHeart size={22} color={color.gold} /></View>
          <View style={{ flex: 1 }}>
            <T v="headline">{`بدك ${other} يتابع معك؟`}</T>
            <T v="footnote" c={color.text2}>نفس صلاحياتك، ومن موبايله. ببلاش ضمن اشتراكك.</T>
          </View>
          {invitedPartner ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Check size={14} color={color.success} strokeWidth={3} /><T v="footnote" c={color.successText}>انبعتت</T></View>
            : <Button small kind="tinted" title="دعوة" onPress={() => setOpen(true)} />}
        </Card>
      </View>
      <Sheet open={open} onClose={() => setOpen(false)} title="دعوة">
        {partnerCode ? (
          <View style={{ alignItems: 'center', gap: space.m }}>
            <T v="subhead" c={color.text2} center>{`خلّي ${other} ينزّل مكمورة ويفتح حساب، وبشاشة «عرّفنا عليك» يكبس «عندي رمز دعوة» ويكتب هالرمز.`}</T>
            <T v="largeTitle" style={{ letterSpacing: 4, writingDirection: 'ltr' }}>{partnerCode}</T>
            <Button title="شارك الرمز" style={{ alignSelf: 'stretch' }} onPress={() => { Share.share({ message: `انضم لعيلتنا على مكمورة. رمز الدعوة: ${partnerCode}` }).catch(() => {}); invitePartner('code'); setOpen(false); }} />
          </View>
        ) : <>
        <T v="subhead" c={color.text2} style={{ marginBottom: space.m }}>رح يوصله رابط لينزّل مكمورة ويفوت على نفس العيلة. بيضيف مهام وبيوافق متلك تماماً، وما بيدفع شي.</T>
        <Field label="البريد" value={mail} onChangeText={setMail} keyboardType="email-address" autoCapitalize="none" placeholder="name@email.com" autoFocus />
        <Button title="إرسال الدعوة" disabled={!okEmail(mail)} onPress={() => { invitePartner(mail.trim()); setOpen(false); }} style={{ marginTop: space.l }} />
        </>}
      </Sheet>
    </Screen>
  );
}
