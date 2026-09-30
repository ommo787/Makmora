import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { Child } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';
import { Avatar, T } from '@/ui/kit';

/** Makmoura app icon in Salimfy colours: a white jar on navy, with a gold star inside. */
export function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 104 104">
      <Defs>
        <LinearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1D3A66" />
          <Stop offset="1" stopColor={color.navy} />
        </LinearGradient>
      </Defs>
      <Rect width={104} height={104} rx={24} fill="url(#ig)" />
      <Rect x={37} y={21} width={30} height={8} rx={3.5} fill="#fff" />
      <Path d="M35 32h34v3c0 3.2 9 5.5 9 14v21a11 11 0 0 1-11 11H37a11 11 0 0 1-11-11V49c0-8.5 9-10.8 9-14z" fill="#fff" />
      <Path d="m52 47.5 3.6 7.3 8 1.2-5.8 5.6 1.4 8-7.2-3.8-7.2 3.8 1.4-8-5.8-5.6 8-1.2z" fill={color.gold} stroke={color.gold} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

/** "Salimfy" endorsement line. The logo stays Latin and LTR. */
export function FromSalimfy() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <T v="footnote" c={color.text2}>من</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', direction: 'ltr' }}>
        <Svg width={22} height={12} viewBox="0 0 46 24">
          <Path d="M12 0a12 12 0 1 1 0 24a12 12 0 1 1 0-24z" fill={color.navy} />
          <Path d="M31 2.3a9.7 9.7 0 1 1 0 19.4a9.7 9.7 0 1 1 0-19.4z" fill="none" stroke={color.gold} strokeWidth={3.6} />
        </Svg>
        <T v="footnote" c={color.navy} style={{ fontFamily: 'IBMPlexSansArabic_600SemiBold', marginStart: 4 }}>Salimfy</T>
      </View>
    </View>
  );
}

/** Small chip naming the child a setup screen is for. */
export function ChildChip({ child }: { child: Child }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, backgroundColor: color.white, borderRadius: radius.pill, paddingStart: 4, paddingEnd: space.m, height: 36 }}>
      <Avatar avatar={child.avatar} photo={child.photo} size={28} />
      <T v="headline" style={{ fontSize: 15 }}>{child.name}</T>
    </View>
  );
}

/** Arabic counting words: 1 مهمة، 3 مهام، 11 مهمة. */
export function count(n: number, one: string, few: string) {
  return `${n} ${n >= 3 && n <= 10 ? few : one}`;
}
export const years = (n: number) => count(n, 'سنة', 'سنين');
export const days = (n: number) => count(n, 'يوم', 'أيام');
export const tasksN = (n: number) => count(n, 'مهمة', 'مهام');

export const SCHOOL = [true, true, true, true, true, false, false];
export const daysLabel = (d: boolean[]) =>
  d.every(Boolean) ? 'كل يوم' : d.join() === SCHOOL.join() ? 'أيام المدرسة' : `${days(d.filter(Boolean).length)} بالأسبوع`;

/** "اليوم", "مبارح", or the weekday name for an older day. */
export function dayName(date: string) {
  const d = new Date(date + 'T12:00');
  const now = new Date(); now.setHours(12, 0, 0, 0);
  const diff = Math.round((now.getTime() - d.getTime()) / 864e5);
  if (diff <= 0) return 'اليوم';
  if (diff === 1) return 'مبارح';
  return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d.getDay()];
}

/** Arabic changes with the child: pick the boy's or the girl's form of a phrase. */
export const gx = (c: Pick<Child, 'avatar'> | undefined, boy: string, girl: string) => (c?.avatar === 'girl' ? girl : boy);
