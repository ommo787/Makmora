import { router } from 'expo-router';
import { Bell, Check, LockOpen, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { TRIAL_DAYS } from '@/data/catalog';
import { loadPrices, PRICES, restore, startTrial, type Plan } from '@/services/purchases';
import { useFamily } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { AppIcon } from '@/ui/brand';
import { Button, Screen, T } from '@/ui/kit';

const STEPS = [
  { I: LockOpen, t: 'اليوم', d: 'كل شي مفتوح لعيلتك، وما بتدفع شي.' },
  { I: Bell, t: `بعد ${TRIAL_DAYS - 2} يوم`, d: 'منبعتلك تذكير قبل ما تخلص التجربة.' },
  { I: Star, t: `بعد ${TRIAL_DAYS} يوم`, d: 'بيبلّش الاشتراك، إلا إذا ألغيته قبلها.' },
];

export default function Paywall() {
  const [plan, setPlan] = useState<Plan>('year');
  const [prices, setPrices] = useState(PRICES);
  const [busy, setBusy] = useState(false);
  const begin = useFamily((s) => s.startTrial);
  useEffect(() => { loadPrices().then(setPrices); }, []);
  const go = async () => {
    setBusy(true);
    const ok = await startTrial(plan);
    setBusy(false);
    if (ok) { begin(plan); router.replace('/started'); }
  };
  return (
    <Screen bg={color.white} footer={<View style={{ gap: space.xs }}>
      <Button title={busy ? 'لحظة…' : 'ابدأ التجربة المجانية'} disabled={busy} icon={busy ? <ActivityIndicator color={color.navy} /> : undefined} onPress={go} />
      <T v="footnote" c={color.text2} center>{`مجاناً ${TRIAL_DAYS} يوم، بعدها ${prices[plan].price} ${plan === 'year' ? 'بالسنة' : 'بالشهر'}.`}</T>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.l }}>
        <Pressable onPress={restore}><T v="footnote" c={color.text2}>استرجاع المشتريات</T></Pressable>
        <T v="footnote" c={color.text2}>الشروط</T><T v="footnote" c={color.text2}>الخصوصية</T>
      </View>
    </View>}>
      <View style={{ alignItems: 'center', marginTop: space.xxl }}>
        <AppIcon size={76} />
        <T v="largeTitle" center style={{ marginTop: space.l }}>جرّب مكمورة مجاناً</T>
        <T v="callout" c={color.text2} center>{`${TRIAL_DAYS} يوم كاملة، وبتلغي وقت ما بدك.`}</T>
      </View>
      <View style={{ marginTop: space.xxl, gap: space.l }}>
        {STEPS.map(({ I, t, d }, i) => (
          <View key={t} style={{ flexDirection: 'row', gap: space.m, alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: i === 0 ? color.gold : color.navy, alignItems: 'center', justifyContent: 'center' }}>
                <I size={20} color={i === 0 ? color.navy : color.white} strokeWidth={2.4} />
              </View>
            </View>
            <View style={{ flex: 1 }}><T v="headline">{t}</T><T v="subhead" c={color.text2}>{d}</T></View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.xxl }}>
        {(['year', 'month'] as Plan[]).map((p) => {
          const on = plan === p;
          return (
            <Pressable key={p} onPress={() => setPlan(p)} accessibilityRole="radio" accessibilityState={{ selected: on }}
              style={{ flex: 1, borderRadius: radius.card, padding: space.l, backgroundColor: on ? color.gold50 : color.mist, borderWidth: 2, borderColor: on ? color.gold : 'transparent', ...(on ? shadow.e1 : {}) }}>
              {p === 'year' ? <View style={{ position: 'absolute', top: -11, end: 12, backgroundColor: color.navy, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 }}><T v="caption" c={color.gold}>وفّر 33%</T></View> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T v="headline">{p === 'year' ? 'سنوي' : 'شهري'}</T>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: on ? color.navy : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: color.text3, alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <Check size={13} color={color.gold} strokeWidth={3.4} /> : null}
                </View>
              </View>
              <T v="title" style={{ marginTop: space.s, writingDirection: 'ltr' }}>{prices[p].price}</T>
              <T v="footnote" c={color.text2}>{p === 'year' ? `يعني ${prices.year.perMonth ?? ''} بالشهر` : 'كل شهر'}</T>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.l, marginTop: space.l }}>
        {['بدون إعلانات', 'بيانات أولادك محمية', 'بتلغي بأي وقت'].map((x) => (
          <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Check size={13} color={color.success} strokeWidth={3} /><T v="footnote" c={color.text2}>{x}</T></View>
        ))}
      </View>
    </Screen>
  );
}
