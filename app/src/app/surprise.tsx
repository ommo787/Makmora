import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SURPRISES } from '@/data/catalog';
import { useFamily } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Button, Glyph, NavBar, Screen, T, Title } from '@/ui/kit';
import { toast } from '@/ui/toast';

/** A family reward: earned together, never a competition between siblings. */
export default function Surprise() {
  const arm = useFamily((s) => s.armSurprise);
  const [key, setKey] = useState('pizza');
  const [when, setWhen] = useState<'all' | 'manual'>('all');
  return (
    <Screen footer={<Button title={when === 'manual' ? 'فاجئهم هلأ' : 'جاهز'} onPress={() => {
      arm(key, when);
      toast(<T v="subhead" c={color.white}>{when === 'manual' ? 'وصلت المفاجأة للأولاد' : 'المفاجأة جاهزة'}</T>);
      router.back();
    }} />}>
      <NavBar />
      <Title sub="شي حلو للعيلة كلها، لما ينجزوا سوا.">مفاجأة للعيلة</Title>
      <T v="headline" style={{ marginTop: space.xl, marginBottom: space.m }}>شو المفاجأة؟</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
        {SURPRISES.map((s) => (
          <Pressable key={s.key} onPress={() => setKey(s.key)} style={{ width: '31.5%', alignItems: 'center', gap: 6, paddingVertical: space.m, borderRadius: radius.card, backgroundColor: key === s.key ? color.gold50 : color.white, borderWidth: 2, borderColor: key === s.key ? color.gold : 'transparent', ...shadow.e1 }}>
            <Glyph name={s.icon} size={48} tone={key === s.key ? 'gold' : 'navy'} />
            <T v="caption" center style={{ fontSize: 13 }}>{s.short}</T>
          </Pressable>
        ))}
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
