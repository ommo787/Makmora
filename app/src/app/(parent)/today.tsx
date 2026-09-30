import { router } from 'expo-router';
import { Check, ChevronLeft, Lock, RotateCcw } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { confirmParent } from '@/services/biometrics';
import { success } from '@/services/haptics';
import { doneCount, earnedToday, useFamily, type Child, type Task, surpriseInfo } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Button, Card, Glyph, Money, Progress, Screen, Sheet, T } from '@/ui/kit';
import { toast } from '@/ui/toast';

const ago = (at?: number) => {
  if (!at) return '';
  const m = Math.max(1, Math.round((Date.now() - at) / 60000));
  return m < 60 ? `قبل ${m} ${m >= 3 && m <= 10 ? 'دقايق' : 'دقيقة'}` : `قبل ${Math.round(m / 60)} ساعة`;
};
const today = new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions).format(new Date());

export default function Today() {
  const { children, parent, secured, setSecured, approve, sendBack, surprise, clearSurprise } = useFamily();
  const [ask, setAsk] = useState<null | (() => void)>(null);
  const pending: { c: Child; t: Task; at?: number }[] = [];
  children.forEach((c) => c.tasks.forEach((t) => { if (c.today[t.id]?.state === 'waiting') pending.push({ c, t, at: c.today[t.id]?.at }); }));
  pending.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));

  /** The first approval asks to protect approvals; after that Face ID (or the passcode) confirms each batch. */
  const guard = async (run: () => void) => {
    if (!secured) return setAsk(() => run);
    if (await confirmParent()) run();
  };
  const ok = (list: typeof pending) => guard(() => {
    list.forEach(({ c, t }) => approve(c.id, t.id));
    success();
    const total = list.reduce((a, x) => a + x.t.reward, 0);
    toast(<><Check size={16} color={color.gold} strokeWidth={3} /><T v="subhead" c={color.white}>{list.length > 1 ? `وافقت على ${list.length} مهام ·` : `انضافوا لمكمورة ${list[0].c.name}`}</T><Money n={total} v="subhead" c={color.white} /></>);
  });
  const sur = surpriseInfo(surprise);

  return (
    <Screen tabs>
      <View style={st.top}>
        <View><T v="subhead" c={color.text2}>{today}</T><T v="largeTitle">اليوم</T></View>
        <Avatar avatar={parent?.avatar ?? 'man'} size={44} />
      </View>

      <View style={st.sec}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
          <T v="title3">بانتظار موافقتك</T>
          {pending.length ? <View style={st.count}><T v="caption" c={color.navy}>{pending.length}</T></View> : null}
        </View>
        {pending.length > 1 ? <Pressable onPress={() => ok(pending)}><T v="headline" c={color.link}>وافق على الكل</T></Pressable> : null}
      </View>
      {pending.length ? (
        <View style={{ gap: space.m }}>
          {pending.map(({ c, t, at }) => (
            <Card key={c.id + t.id} style={{ gap: space.m }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <View>
                  <Avatar avatar={c.avatar} photo={c.photo} size={50} />
                  <View style={st.mini}><Glyph name={t.icon} size={24} /></View>
                </View>
                <View style={{ flex: 1 }}><T v="headline">{`${c.name} ${t.did}`}</T><T v="footnote" c={color.text2}>{ago(at)}</T></View>
                <Money n={t.reward} v="headline" />
              </View>
              <View style={{ flexDirection: 'row', gap: space.s }}>
                <Button small kind="tinted" title="رجّعها" icon={<RotateCcw size={16} color={color.navy} />} style={{ flex: 1 }}
                  onPress={() => { sendBack(c.id, t.id); toast(<T v="subhead" c={color.white}>{`رجعت المهمة لـ${c.name} ليعيدها`}</T>); }} />
                <Button small title="موافقة" icon={<Check size={17} color={color.navy} strokeWidth={3} />} style={{ flex: 2 }} onPress={() => ok([{ c, t, at }])} />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.xl }}>
          <View style={st.okc}><Check size={24} color="#fff" strokeWidth={3} /></View>
          <View style={{ flex: 1 }}><T v="headline">ما في شي بانتظارك</T><T v="footnote" c={color.text2}>لما يخلّص حدا مهمة، بتوصلك هون.</T></View>
        </Card>
      )}

      {sur && surprise?.status === 'earned' ? (
        <Card style={{ marginTop: space.xl, backgroundColor: color.navy, gap: space.m }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Glyph name={sur.icon} size={52} tone="gold" />
            <View style={{ flex: 1 }}><T v="footnote" c={color.gold}>مفاجأة العيلة جاهزة</T><T v="title3" c={color.white}>{sur.title}</T></View>
          </View>
          <Button small kind="primary" title="تمّت المفاجأة" onPress={() => { clearSurprise(); toast(<T v="subhead" c={color.white}>صارت ذكرى حلوة للعيلة</T>); }} />
        </Card>
      ) : null}

      <View style={st.sec}><T v="title3">الأولاد اليوم</T></View>
      <Card style={{ padding: 0 }}>
        {children.map((c, i) => (
          <Pressable key={c.id} onPress={() => router.push(`/kid/${c.id}`)} style={({ pressed }) => [st.kid, i > 0 && st.hair, pressed && { backgroundColor: color.navy50 }]}>
            <Ring child={c} />
            <View style={{ flex: 1, gap: 2 }}>
              <T v="headline">{c.name}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T v="footnote" c={color.text2}>{`${doneCount(c)} من ${c.tasks.length} · جمع اليوم`}</T><Money n={earnedToday(c)} v="footnote" c={color.text2} />
              </View>
              {c.goal ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: 4 }}>
                  <View style={{ flex: 1 }}><Progress value={c.balance / c.goal.amount} height={6} /></View>
                  <T v="caption" c={color.text2}>{`${c.goal.name} · ${Math.round(c.balance)} من ${c.goal.amount}`}</T>
                </View>
              ) : null}
            </View>
            <ChevronLeft size={18} color={color.text3} />
          </Pressable>
        ))}
      </Card>

      {!surprise ? (
        <Pressable onPress={() => router.push('/surprise')} style={({ pressed }) => [st.surprise, pressed && { opacity: 0.9 }]}>
          <Glyph name="gift" size={44} tone="gold" />
          <View style={{ flex: 1 }}><T v="headline">جهّز مفاجأة للعيلة</T><T v="footnote" c={color.text2}>بيتزا، طلعة، ليلة أفلام، لما يخلّصوا كلهم مهامهم</T></View>
          <ChevronLeft size={18} color={color.text3} />
        </Pressable>
      ) : surprise.status === 'armed' && sur ? (
        <View style={st.surprise}>
          <Glyph name={sur.icon} size={44} tone="gold" />
          <View style={{ flex: 1 }}><T v="headline">{`مفاجأة جاهزة: ${sur.title}`}</T><T v="footnote" c={color.text2}>بتطلع للأولاد لما يخلّصوا كلهم مهامهم اليوم</T></View>
        </View>
      ) : null}
      <View style={{ height: 96 }} />

      <Sheet open={!!ask} onClose={() => setAsk(null)}>
        <View style={{ alignItems: 'center', gap: space.s, paddingTop: space.m }}>
          <View style={st.lock}><Lock size={30} color={color.gold} strokeWidth={2.2} /></View>
          <T v="title" center style={{ marginTop: space.s }}>خلّي الموافقات إلك بس</T>
          <T v="subhead" c={color.text2} center>الأولاد ممكن يستعملوا نفس الجهاز. منطلب وجهك قبل أي موافقة، لحتى ما حدا يوافق عنك.</T>
        </View>
        <Button title="استعمل Face ID" style={{ marginTop: space.xl }} onPress={async () => {
          const run = ask; setAsk(null);
          if (await confirmParent('فعّل Face ID للموافقات')) { setSecured(true); run?.(); }
        }} />
        <Button kind="plain" title="بدلاً منه، رمز من ٤ أرقام" onPress={() => { const run = ask; setAsk(null); setSecured(true); run?.(); }} />
      </Sheet>
    </Screen>
  );
}

function Ring({ child }: { child: Child }) {
  const done = doneCount(child), n = child.tasks.length || 1;
  const full = done === n;
  return (
    <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 3, borderColor: full ? color.success : done ? color.gold : color.navy100, alignItems: 'center', justifyContent: 'center' }}>
      <Avatar avatar={child.avatar} photo={child.photo} size={46} />
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: space.l },
  sec: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xxl, marginBottom: space.m, marginHorizontal: space.xs },
  count: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: color.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  mini: { position: 'absolute', bottom: -4, start: -6, borderRadius: 8, borderWidth: 2, borderColor: color.white, overflow: 'hidden' },
  okc: { width: 46, height: 46, borderRadius: 23, backgroundColor: color.success, alignItems: 'center', justifyContent: 'center' },
  kid: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l },
  hair: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.border },
  surprise: { flexDirection: 'row', alignItems: 'center', gap: space.m, backgroundColor: color.white, borderRadius: radius.card, padding: space.l, marginTop: space.xl, ...shadow.e1 },
  lock: { width: 64, height: 64, borderRadius: 18, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
});
