import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { useFamily, dayKey } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';
import { dayName } from '@/ui/brand';
import { Card, Glyph, Group, Money, NavBar, Progress, Row, Screen, SectionLabel, T, Title } from '@/ui/kit';

const BODY = 'M35 32h34v3c0 3.2 9 5.5 9 14v21a11 11 0 0 1-11 11H37a11 11 0 0 1-11-11V49c0-8.5 9-10.8 9-14z';
const ARect = Animated.createAnimatedComponent(Rect);

/** The jar from the app icon, filling with gold as the child gets closer to the goal. */
function Jar({ pct, size = 200 }: { pct: number; size?: number }) {
  const level = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(level, { toValue: Math.max(0.04, Math.min(1, pct)), duration: 900, useNativeDriver: false }).start();
  }, [pct, level]);
  // body runs from y=32 to y=81 in the icon's 104 grid
  const y = level.interpolate({ inputRange: [0, 1], outputRange: [81, 32] });
  return (
    <Svg width={size} height={size} viewBox="16 14 72 72">
      <Defs><ClipPath id="jar"><Path d={BODY} /></ClipPath></Defs>
      <Rect x={37} y={21} width={30} height={8} rx={3.5} fill={color.navy} />
      <Path d={BODY} fill={color.navy50} stroke={color.navy} strokeWidth={2.4} />
      <G clipPath="url(#jar)">
        <ARect x={20} y={y} width={70} height={60} fill={color.gold} />
      </G>
      <Path d={BODY} fill="none" stroke={color.navy} strokeWidth={2.4} />
    </Svg>
  );
}

/** "مكمورتي": what I saved, how close my goal is, and which tasks it came from. */
export default function MyJar() {
  const { children, activeChildId } = useFamily();
  const c = children.find((x) => x.id === activeChildId);
  if (!c) return null;
  const pct = c.goal ? c.balance / c.goal.amount : 0;
  // newest first, grouped by day
  const items = [...c.approved].sort((a, b) => b.at - a.at).slice(0, 40).map((a) => {
    const t = c.tasks.find((x) => x.id === a.taskId);
    return { ...a, name: t?.name ?? 'مهمة', icon: t?.icon ?? 'sparkles' as const, day: dayKey(new Date(a.at)) };
  });
  const days = [...new Set(items.map((i) => i.day))];
  return (
    <Screen bg={color.white}>
      <NavBar />
      <Title>مكمورتي</Title>
      <View style={{ alignItems: 'center', marginTop: space.l }}>
        <Jar pct={c.goal ? pct : 0.5} />
        <Money n={c.balance} v="hero" />
        <T v="subhead" c={color.text2}>جمعت لحد هلأ</T>
      </View>

      {c.goal ? (
        <Card style={{ marginTop: space.xl, gap: space.m, backgroundColor: color.mist }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Glyph name={c.goal.icon} size={48} tone="gold" />
            <View style={{ flex: 1 }}><T v="footnote" c={color.text2}>هدفي</T><T v="title3">{c.goal.name}</T></View>
            <View style={{ alignItems: 'flex-end' }}><T v="footnote" c={color.text2}>باقي</T><Money n={Math.max(0, c.goal.amount - c.balance)} v="headline" /></View>
          </View>
          <Progress value={pct} height={12} />
        </Card>
      ) : null}

      <SectionLabel>من وين جمعت</SectionLabel>
      {items.length ? days.map((d) => (
        <View key={d} style={{ marginBottom: space.m }}>
          <T v="footnote" c={color.text2} style={{ marginBottom: space.xs, marginHorizontal: space.s }}>{dayName(d)}</T>
          <Group>
            {items.filter((i) => i.day === d).map((i) => (
              <Row key={i.taskId + i.at} lead={<Glyph name={i.icon} size={36} />} title={i.name}
                end={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}><T v="headline" c={color.successText}>+</T><Money n={i.reward} v="headline" c={color.successText} /></View>} />
            ))}
          </Group>
        </View>
      )) : (
        <View style={{ alignItems: 'center', gap: space.s, padding: space.xl, borderRadius: radius.card, backgroundColor: color.mist }}>
          <Glyph name="sparkles" size={44} tone="soft" />
          <T v="subhead" c={color.text2} center>لسا ما جمعت شي. كل مهمة بتخلّصها وبتنوافق عليها بتنزل هون.</T>
        </View>
      )}
    </Screen>
  );
}
