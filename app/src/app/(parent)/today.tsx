import { router } from 'expo-router';
import { Check, ChevronLeft, RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { success } from '@/services/haptics';
import { doneCount, earnedToday, useFamily, type Child, type LateTask, type Task, surpriseInfo } from '@/state/store';
import type { IconName } from '@/ui/icons';
import { dayName } from '@/ui/brand';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Button, Card, Glyph, Money, Progress, Screen, T } from '@/ui/kit';
import { toast } from '@/ui/toast';

const ago = (at?: number) => {
  if (!at) return '';
  const m = Math.max(1, Math.round((Date.now() - at) / 60000));
  return m < 60 ? `قبل ${m} ${m >= 3 && m <= 10 ? 'دقايق' : 'دقيقة'}` : `قبل ${Math.round(m / 60)} ساعة`;
};
const today = new Intl.DateTimeFormat('ar', { weekday: 'long', day: 'numeric', month: 'long', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions).format(new Date());

type Pending = { c: Child; key: string; did: string; icon: IconName; reward: number; at?: number; t?: Task; late?: LateTask };

export default function Today() {
  const { children, parent, approve, approveLate, dropLate, sendBack, surprise, clearSurprise } = useFamily();
  // today's finished tasks, plus any from earlier days nobody approved yet (oldest first)
  const pending: Pending[] = [];
  children.forEach((c) => {
    (c.late ?? []).forEach((l) => pending.push({ c, key: l.id, did: l.did, icon: l.icon, reward: l.reward, at: l.at, late: l }));
    c.tasks.forEach((t) => { if (c.today[t.id]?.state === 'waiting') pending.push({ c, key: t.id, did: t.did, icon: t.icon, reward: t.reward, at: c.today[t.id]?.at, t }); });
  });
  pending.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));

  /** One tap approves. No Face ID: either parent approves, and the child simply sees who did. */
  const ok = (list: typeof pending) => {
    list.forEach(({ c, t, late }) => (late ? approveLate(c.id, late.id) : t && approve(c.id, t.id)));
    success();
    const total = list.reduce((a, x) => a + x.reward, 0);
    toast(<><Check size={16} color={color.gold} strokeWidth={3} /><T v="subhead" c={color.white}>{list.length > 1 ? `وافقت على ${list.length} مهام ·` : `انضافوا لمكمورة ${list[0].c.name}`}</T><Money n={total} v="subhead" c={color.white} /></>);
  };
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
          {pending.map((p) => { const { c, key, did, icon, reward, at, late } = p; return (
            <Card key={c.id + key} style={{ gap: space.m }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <View>
                  <Avatar avatar={c.avatar} photo={c.photo} size={50} />
                  <View style={st.mini}><Glyph name={icon} size={24} /></View>
                </View>
                <View style={{ flex: 1 }}><T v="headline">{`${c.name} ${did}`}</T>
                  {late ? <T v="footnote" c={color.gold700}>{dayName(late.date)}</T> : <T v="footnote" c={color.text2}>{ago(at)}</T>}</View>
                <Money n={reward} v="headline" />
              </View>
              <View style={{ flexDirection: 'row', gap: space.s }}>
                {late
                  ? <Button small kind="tinted" title="ما انعملت" style={{ flex: 1 }} onPress={() => dropLate(c.id, late.id)} />
                  : <Button small kind="tinted" title="رجّعها" icon={<RotateCcw size={16} color={color.navy} />} style={{ flex: 1 }}
                      onPress={() => { sendBack(c.id, key); toast(<T v="subhead" c={color.white}>{`رجعت المهمة لـ${c.name} ليعيدها`}</T>); }} />}
                <Button small title="موافقة" icon={<Check size={17} color={color.navy} strokeWidth={3} />} style={{ flex: 2 }} onPress={() => ok([p])} />
              </View>
            </Card>
          ); })}
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
          <View style={{ flex: 1 }}><T v="headline">جهّز مفاجأة للعيلة</T><T v="footnote" c={color.text2}>مشوار، غدا برا، فيلم المسا، لما يخلّصوا كلهم مهامهم</T></View>
          <ChevronLeft size={18} color={color.text3} />
        </Pressable>
      ) : surprise.status === 'armed' && sur ? (
        <View style={st.surprise}>
          <Glyph name={sur.icon} size={44} tone="gold" />
          <View style={{ flex: 1 }}><T v="headline">{`مفاجأة جاهزة: ${sur.title}`}</T><T v="footnote" c={color.text2}>بتطلع للأولاد لما يخلّصوا كلهم مهامهم اليوم</T></View>
        </View>
      ) : null}
      <View style={{ height: 96 }} />

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
});
