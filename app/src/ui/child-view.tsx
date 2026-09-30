import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronLeft, Hourglass, Star } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { dayKey, type Child, type TaskState } from '@/state/store';
import { success, tap } from '@/services/haptics';
import { play } from '@/services/sound';
import { color, radius, shadow, space } from '@/theme/tokens';
import { Avatar, Glyph, Money, Progress, T } from '@/ui/kit';
import { gx } from '@/ui/brand';

const greeting = () => (new Date().getHours() < 12 ? 'صباح الخير' : 'مسا الخير');

/**
 * The child's own screen: who I am, my goal filling up, and today's tasks as big icon tiles.
 * Icon first, then the picture, then the number, then the word, so a 6-year-old can use it.
 */
export function ChildView({ child, preview, onTask, headerEnd, onGoal }: { child: Child; preview?: boolean; onTask?: (taskId: string, state: TaskState) => void; headerEnd?: ReactNode; onGoal?: () => void }) {
  const g = child.goal;
  const pct = g ? child.balance / g.amount : 0;
  const state = (id: string, i: number): TaskState => (preview ? (i === 0 ? 'waiting' : 'todo') : child.today[id]?.state ?? 'todo');
  return (
    <View style={{ gap: space.l }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
        <Avatar avatar={child.avatar} photo={child.photo} size={60} ring={color.gold} />
        <View>
          <T v="subhead" c={color.text2}>{greeting()}</T>
          <T v="title">{child.name}</T>
        </View>
        {headerEnd ? <View style={{ marginStart: 'auto' }}>{headerEnd}</View> : null}
      </View>

      {g ? (
        <Pressable disabled={!onGoal} onPress={() => { tap(); onGoal?.(); }} accessibilityRole="button" accessibilityLabel="مكمورتي"
          style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}>
        <LinearGradient colors={['#1D3A66', color.navy, '#060F1F']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={st.goal}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Glyph name={g.icon} size={48} tone="gold" />
            <View style={{ flex: 1 }}>
              <T v="footnote" c={color.navy300}>هدفي</T>
              <T v="title3" c={color.white}>{g.name}</T>
            </View>
            {onGoal ? (
              <View style={st.more}><T v="footnote" c={color.gold}>مكمورتي</T><ChevronLeft size={14} color={color.gold} strokeWidth={2.6} /></View>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: space.l }}>
            <Money n={child.balance} v="largeTitle" c={color.white} />
            <T v="subhead" c={color.navy300} style={{ marginBottom: 6 }}>من</T>
            <View style={{ marginBottom: 6 }}><Money n={g.amount} v="subhead" c={color.navy300} /></View>
          </View>
          <View style={{ marginTop: space.m }}><Progress value={pct} height={12} track="rgba(255,255,255,0.14)" /></View>
          <T v="footnote" c={color.navy300} style={{ marginTop: space.s }}>
            {pct >= 1 ? 'وصلت لهدفك!' : `باقي ${Math.max(0, Math.ceil(g.amount - child.balance))}، ${gx(child, 'كمّل!', 'كمّلي!')}`}
          </T>
        </LinearGradient>
        </Pressable>
      ) : null}

      <Week child={child} />

      <T v="title3">مهامي اليوم</T>
      <View style={st.grid}>
        {child.tasks.map((t, i) => (
          <TaskTile key={t.id} name={t.name} icon={t.icon} reward={t.reward} state={state(t.id, i)}
            onPress={preview || !onTask ? undefined : () => onTask(t.id, state(t.id, i))} />
        ))}
      </View>
    </View>
  );
}

function TaskTile({ name, icon, reward, state, onPress }:
  { name: string; icon: Parameters<typeof Glyph>[0]['name']; reward: number; state: TaskState; onPress?: () => void }) {
  const pop = useRef(new Animated.Value(1)).current;
  const prev = useRef(state);
  useEffect(() => {
    if (prev.current !== state) {
      prev.current = state;
      pop.setValue(0.9);
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }).start();
    }
  }, [state, pop]);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${name}${state === 'waiting' ? '، بانتظار الموافقة' : state === 'done' ? '، تم' : ''}`}
      disabled={!onPress || state === 'done'} onPress={() => { if (state === 'todo') { success(); play('tap'); } else tap(); onPress?.(); }} style={{ width: '48%' }}>
      <Animated.View style={[st.tile, state === 'waiting' && st.wait, state === 'done' && st.done, { transform: [{ scale: pop }] }]}>
        {state !== 'todo' ? (
          <View style={[st.badge, { backgroundColor: state === 'done' ? color.success : color.gold }]}>
            {state === 'done' ? <Check size={16} color="#fff" strokeWidth={3.2} /> : <Hourglass size={15} color={color.navy} strokeWidth={2.6} />}
          </View>
        ) : null}
        <View style={{ opacity: state === 'done' ? 0.45 : 1 }}><Glyph name={icon} size={64} /></View>
        <T v="headline" center numberOfLines={1} c={state === 'done' ? color.text2 : color.text}>{name}</T>
        {state === 'waiting' ? <T v="caption" c={color.gold700}>بانتظار الموافقة</T>
          : state === 'done' ? <T v="caption" c={color.successText}>تمّت</T>
          : <Money n={reward} v="caption" c={color.text2} />}
      </Animated.View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  goal: { borderRadius: 26, padding: space.l, ...shadow.e2 },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  week: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: color.white, borderRadius: radius.card, padding: space.m, borderWidth: 1, borderColor: color.border },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.m },
  tile: { alignItems: 'center', gap: space.s, paddingTop: space.l, paddingBottom: space.m, borderRadius: radius.card + 4, backgroundColor: color.white, borderWidth: 2, borderColor: color.border, minHeight: 150 },
  wait: { backgroundColor: color.gold50, borderColor: color.gold },
  done: { backgroundColor: color.successBg, borderColor: 'transparent' },
  badge: { position: 'absolute', top: 10, start: 10, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});

/** A small ring: how much of a day's tasks got done. Full days get a gold star. */
export function DayRing({ done, planned, size = 36, today }: { done: number; planned: number; size?: number; today?: boolean }) {
  const p = planned ? Math.min(1, done / planned) : 0;
  const r = size / 2 - 3, len = 2 * Math.PI * r;
  if (p >= 1) return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.gold, alignItems: 'center', justifyContent: 'center' }}><Star size={size * 0.5} color={color.navy} fill={color.navy} /></View>;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={today ? color.navy300 : color.navy100} strokeWidth={4} fill="none" strokeDasharray={today ? '3 4' : undefined} />
      {p > 0 ? <Circle cx={size / 2} cy={size / 2} r={r} stroke={color.gold} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={`${len * p} ${len}`} /> : null}
    </Svg>
  );
}

const LETTER = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
/** "أسبوعي": the last seven days, today last. Each day stands alone: tomorrow is always a fresh start. */
function Week({ child }: { child: Child }) {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return { key: dayKey(d), letter: LETTER[d.getDay()] }; });
  const todayDone = child.tasks.filter((t) => child.today[t.id]?.state === 'done').length;
  return (
    <View style={{ gap: space.s }}>
      <T v="title3">أسبوعي</T>
      <View style={st.week}>
        {days.map((d, i) => {
          const isToday = i === 6;
          const log = child.log?.find((x) => x.date === d.key);
          return (
            <View key={d.key} style={{ alignItems: 'center', gap: 4 }}>
              <DayRing done={isToday ? todayDone : log?.done.length ?? 0} planned={isToday ? child.tasks.length : log?.planned ?? 0} today={isToday} />
              <T v="caption" c={isToday ? color.text : color.text2}>{isToday ? 'اليوم' : d.letter}</T>
            </View>
          );
        })}
      </View>
    </View>
  );
}
