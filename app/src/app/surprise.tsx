import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { iconForSurprise, SURPRISES } from '@/data/catalog';
import { useFamily } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Button, Field, Glyph, NavBar, Screen, T, Title } from '@/ui/kit';
import { Sparkles } from 'lucide-react-native';
import { toast } from '@/ui/toast';

/** A family reward: earned together, never a competition between siblings. */
export default function Surprise() {
  const arm = useFamily((s) => s.armSurprise);
  const [key, setKey] = useState('park');
  const [own, setOwn] = useState('');
  const [when, setWhen] = useState<'all' | 'manual'>('all');
  const custom = key === 'own' && own.trim();
  const picked = custom ? { key: 'own', title: own.trim(), icon: iconForSurprise(own) } : SURPRISES.find((x) => x.key === key)!;
  return (
    <Screen footer={<Button title={when === 'manual' ? 'فاجئهم هلأ' : 'جاهز'} disabled={key === 'own' && !custom} onPress={() => {
      arm(picked, when);
      toast(<T v="subhead" c={color.white}>{when === 'manual' ? 'وصلت المفاجأة للأولاد' : 'المفاجأة جاهزة'}</T>);
      if (router.canGoBack()) router.back(); else router.replace('/today');
    }} />}>
      <NavBar />
      <Title sub="شي حلو للعيلة كلها، لما ينجزوا سوا.">مفاجأة للعيلة</Title>
      <T v="headline" style={{ marginTop: space.xl, marginBottom: space.m }}>شو المفاجأة؟</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
        {SURPRISES.map((s) => (
          <Pressable key={s.key} onPress={() => setKey(s.key)} style={{ width: '31.5%', alignItems: 'center', gap: 6, paddingVertical: space.m, borderRadius: radius.card, backgroundColor: key === s.key ? color.gold50 : color.white, borderWidth: 2, borderColor: key === s.key ? color.gold : 'transparent', ...shadow.e1 }}>
            <Glyph name={s.icon} size={48} tone={key === s.key ? 'gold' : 'navy'} />
            <T v="caption" center numberOfLines={1} style={{ fontSize: 13 }}>{s.title}</T>
          </Pressable>
        ))}
      </View>
      <T v="footnote" c={color.text2} style={{ marginTop: space.l, marginBottom: space.s, marginHorizontal: space.s }}>أو اكتب مفاجأة من عندك</T>
      <Field value={own} onChangeText={(t) => { setOwn(t); setKey(t.trim() ? 'own' : 'park'); }} placeholder="مثلاً: سهرة ألعاب بالبيت"
        lead={<Glyph name={own.trim() ? iconForSurprise(own) : 'gift'} size={34} tone={key === 'own' ? 'gold' : 'navy'} />}
        style={key === 'own' ? { borderWidth: 2, borderColor: color.gold } : undefined} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.s, marginHorizontal: space.s }}>
        <Sparkles size={13} color={color.gold700} /><T v="caption" c={color.text2}>بنختار الأيقونة حسب الاسم</T>
      </View>
      <T v="headline" style={{ marginTop: space.xl, marginBottom: space.m }}>إمتى بتطلع؟</T>
      <View style={{ gap: space.s }}>
        {([['all', 'لما يخلّصوا كلهم مهامهم اليوم'], ['manual', 'هلأ، مفاجأة من ماما وبابا']] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setWhen(k)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.l, borderRadius: radius.card, backgroundColor: color.white, borderWidth: 2, borderColor: when === k ? color.gold : 'transparent' }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: when === k ? 7 : 1.5, borderColor: when === k ? color.navy : color.text3 }} />
            <T v="body">{l}</T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
