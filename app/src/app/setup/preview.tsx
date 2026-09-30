import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useFamily } from '@/state/store';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Button, NavBar, Screen, T } from '@/ui/kit';
import { ChildView } from '@/ui/child-view';

/** "This is what Salim sees tomorrow": the moment of value before the price. */
export default function Preview() {
  const children = useFamily((s) => s.children);
  const [i, setI] = useState(0);
  const c = children[i];
  if (!c) return null;
  return (
    <Screen footer={<View style={{ gap: space.xs }}><Button title="كمّل" onPress={() => router.push('/paywall')} /><T v="footnote" c={color.text2} center>فاضل خطوة وحدة</T></View>}>
      <NavBar />
      <T v="largeTitle">{`هيك رح يشوف ${c.name} مكمورته بكرة الصبح`}</T>
      {children.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.m }}>
          {children.map((x, j) => (
            <Pressable key={x.id} onPress={() => setI(j)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, height: 40, paddingStart: 5, paddingEnd: space.m, borderRadius: radius.pill, backgroundColor: color.white, borderWidth: 2, borderColor: j === i ? color.gold : 'transparent' }}>
              <Avatar avatar={x.avatar} photo={x.photo} size={30} /><T v="headline" style={{ fontSize: 15 }}>{x.name}</T>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={{ marginTop: space.l, backgroundColor: color.white, borderRadius: 32, padding: space.l, ...shadow.e2 }}>
        <ChildView child={c} preview />
      </View>
    </Screen>
  );
}
