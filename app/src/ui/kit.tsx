import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';
import { type ReactNode, useEffect, useRef } from 'react';
import {
  Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AVATARS, type AvatarKey } from '@/data/catalog';
import { deviceCurrency, fmt } from '@/services/money';
import { tap } from '@/services/haptics';
import { Icon, type IconName } from '@/ui/icons';
import { color, font, GUTTER, radius, shadow, space, type } from '@/theme/tokens';

/* ---------- text ---------- */
type Variant = keyof typeof type;
export function T({ v = 'body', c = color.text, center, style, children, numberOfLines }:
  { v?: Variant; c?: string; center?: boolean; style?: StyleProp<TextStyle>; children: ReactNode; numberOfLines?: number }) {
  return <Text numberOfLines={numberOfLines} style={[type[v], { color: c }, center && { textAlign: 'center' }, style]}>{children}</Text>;
}

/* ---------- screen scaffolding ---------- */
export function Screen({ children, footer, bg = color.mist, scroll = true, padTop = true, tabs = false }:
  { children: ReactNode; footer?: ReactNode; bg?: string; scroll?: boolean; padTop?: boolean; tabs?: boolean }) {
  // tab screens leave room for the floating tab bar
  const body = <View style={{ paddingHorizontal: GUTTER, paddingTop: padTop ? space.s : 0, paddingBottom: tabs ? 120 : space.xxl, gap: 0 }}>{children}</View>;
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{body}</ScrollView> : <View style={{ flex: 1 }}>{body}</View>}
      {footer ? <View style={{ paddingHorizontal: GUTTER, paddingTop: space.m, paddingBottom: space.s, backgroundColor: bg }}>{footer}</View> : null}
    </SafeAreaView>
  );
}

/** Round glass back button (back points right in Arabic), plus an optional item on the other side. */
export function NavBar({ back = true, end, onBack }: { back?: boolean; end?: ReactNode; onBack?: () => void }) {
  return (
    <View style={s.nav}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="رجوع" onPress={() => { tap(); if (onBack) onBack(); else if (router.canGoBack()) router.back(); else router.replace('/'); }}
          style={({ pressed }) => [s.round, pressed && { transform: [{ scale: 0.92 }] }]}>
          <ChevronRight size={22} color={color.navy} strokeWidth={2.4} />
        </Pressable>
      ) : <View />}
      {end}
    </View>
  );
}

export function Title({ children, sub, center }: { children: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <View style={{ marginTop: space.s, gap: space.xs }}>
      <T v="largeTitle" center={center}>{children}</T>
      {sub ? <T v="callout" c={color.text2} center={center}>{sub}</T> : null}
    </View>
  );
}
export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <T v="footnote" c={color.text2} style={{ marginTop: space.xxl, marginBottom: space.s, marginHorizontal: space.l }}>{children}</T>
);

/* ---------- buttons ---------- */
type BtnKind = 'primary' | 'secondary' | 'tinted' | 'plain' | 'glass' | 'apple' | 'danger';
export function Button({ title, onPress, kind = 'primary', icon, disabled, small, style }:
  { title: string; onPress?: () => void; kind?: BtnKind; icon?: ReactNode; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle> }) {
  const k = btn[kind];
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
      onPress={() => { tap(); onPress?.(); }}
      style={({ pressed }) => [s.btn, small && s.btnSmall, k.box, disabled && s.btnOff, pressed && !disabled && { transform: [{ scale: 0.97 }], opacity: 0.92 }, style]}>
      {icon}
      <Text style={[type.headline, { color: disabled ? color.text3 : k.text }, small && { fontSize: 15 }]}>{title}</Text>
    </Pressable>
  );
}
const btn: Record<BtnKind, { box: ViewStyle; text: string }> = {
  primary: { box: { backgroundColor: color.gold, ...shadow.e2 }, text: color.navy },
  secondary: { box: { backgroundColor: color.navy }, text: color.white },
  tinted: { box: { backgroundColor: color.navy50 }, text: color.navy },
  glass: { box: { backgroundColor: color.white, borderWidth: 1, borderColor: color.border }, text: color.navy },
  plain: { box: { backgroundColor: 'transparent', height: 44 }, text: color.link },
  apple: { box: { backgroundColor: '#000' }, text: color.white },
  danger: { box: { backgroundColor: color.white, borderWidth: 1, borderColor: color.border }, text: color.error },
};

/* ---------- surfaces ---------- */
export const Card = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[s.card, style]}>{children}</View>
);
/** Grouped list: rows separated by a hairline that starts after the leading icon. */
export function Group({ children, style, inset = 68 }: { children: ReactNode[] | ReactNode; style?: StyleProp<ViewStyle>; inset?: number }) {
  const items = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  return (
    <View style={[s.card, { paddingVertical: 0 }, style]}>
      {items.map((ch, i) => (
        <View key={i}>
          {i > 0 ? <View style={[s.hair, { marginStart: inset }]} /> : null}
          {ch}
        </View>
      ))}
    </View>
  );
}
export function Row({ lead, title, sub, end, onPress, minHeight = 60 }:
  { lead?: ReactNode; title: ReactNode; sub?: ReactNode; end?: ReactNode; onPress?: () => void; minHeight?: number }) {
  const inner = (
    <View style={[s.row, { minHeight }]}>
      {lead}
      <View style={{ flex: 1, minWidth: 0 }}>
        {typeof title === 'string' ? <T v="body" numberOfLines={1}>{title}</T> : title}
        {sub ? (typeof sub === 'string' ? <T v="footnote" c={color.text2}>{sub}</T> : sub) : null}
      </View>
      {end}
    </View>
  );
  return onPress ? <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => pressed && { backgroundColor: color.navy50 }}>{inner}</Pressable> : inner;
}

/** App-style icon tile: navy with a white glyph (same recipe as the app icon). */
export function Glyph({ name, size = 40, tone = 'navy' }: { name: IconName; size?: number; tone?: 'navy' | 'gold' | 'soft' }) {
  const g = tone === 'gold' ? [color.gold300, color.gold] as const : tone === 'soft' ? [color.navy50, color.navy100] as const : [color.navy700, color.navy] as const;
  const fg = tone === 'navy' ? color.white : color.navy;
  return (
    <LinearGradient colors={g} style={{ width: size, height: size, borderRadius: size * 0.28, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.56} color={fg} strokeWidth={2.2} />
    </LinearGradient>
  );
}

export function Avatar({ avatar, photo, size = 44, ring }: { avatar?: AvatarKey; photo?: string; size?: number; ring?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.navy50, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', borderWidth: ring ? 2 : 0, borderColor: ring }}>
      {photo ? <Image source={{ uri: photo }} style={{ width: size, height: size }} />
        : avatar ? <Image source={AVATARS[avatar]} style={{ width: size * 0.96, height: size * 0.96 }} resizeMode="contain" /> : null}
    </View>
  );
}

/* ---------- money ---------- */
/** The official Saudi riyal sign (Saudi-Riyal-Font by Emran Alhaddad, SIL OFL 1.1). */
export function RiyalSign({ size = 14, c = color.text }: { size?: number; c?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1256 1256">
      <Path fill={c} d="M750,1119 C730,1163,716,1211,711,1262 C711,1262,1136,1172,1136,1172 C1156,1127,1169,1079,1174,1028 C1174,1028,750,1119,750,1119Z M1136,901 C1136,901,1136,901,1136,901 C1156,857,1169,809,1174,758 C1174,758,843,828,843,828 C843,828,843,693,843,693 C843,693,1136,631,1136,631 C1156,587,1169,538,1174,488 C1174,488,843,558,843,558 C843,558,843,72,843,72 C793,100,748,138,711,183 C711,183,711,586,711,586 C711,586,579,614,579,614 C579,614,579,6,579,6 C528,34,483,72,447,117 C447,117,447,642,447,642 C447,642,151,705,151,705 C131,750,117,798,112,849 C112,849,447,777,447,777 C447,777,447,948,447,948 C447,948,88,1024,88,1024 C68,1068,55,1117,50,1167 C50,1167,425,1088,425,1088 C456,1081,482,1063,499,1038 C499,1038,568,936,568,936 C568,936,568,936,568,936 C575,926,579,913,579,899 C579,899,579,749,579,749 C579,749,711,721,711,721 C711,721,711,992,711,992 C711,992,1136,901,1136,901Z" />
    </Svg>
  );
}
/** An amount in the family currency: "12 ⃁". */
export function Money({ n, v = 'headline', c = color.text }: { n: number; v?: Variant; c?: string }) {
  const cur = deviceCurrency();
  const sz = type[v].fontSize * 0.82;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <T v={v} c={c}>{fmt(n)}</T>
      {cur.code === 'SAR' ? <RiyalSign size={sz} c={c} /> : <T v={v} c={c}>{cur.symbol}</T>}
    </View>
  );
}

export function Progress({ value, height = 8, track = color.navy100, fill = color.gold }: { value: number; height?: number; track?: string; fill?: string }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(w, { toValue: Math.max(0, Math.min(1, value)), duration: 700, useNativeDriver: false }).start(); }, [value, w]);
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={{ height, borderRadius: height, backgroundColor: fill, width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

/* ---------- inputs ---------- */
export function Field({ label, lead, style, ...p }: TextInputProps & { label?: string; lead?: ReactNode }) {
  return (
    <View style={[s.field, style as ViewStyle]}>
      {lead}
      {label ? <T v="body" style={{ width: 84 }}>{label}</T> : null}
      <TextInput placeholderTextColor={color.text3} style={[type.body, { flex: 1, minWidth: 0, color: color.text, paddingVertical: 12, textAlign: p.keyboardType === 'email-address' || p.secureTextEntry ? 'left' : 'right' }]} {...p} />
    </View>
  );
}
export function Stepper({ value, onChange, step = 1, min = 0 }: { value: number; onChange: (n: number) => void; step?: number; min?: number }) {
  return (
    <View style={s.stepper}>
      <Pressable accessibilityLabel="أقل" onPress={() => { tap(); onChange(Math.max(min, Math.round((value - step) * 100) / 100)); }} style={s.stepBtn}><T v="title3">−</T></Pressable>
      <TextInput value={fmt(value)} keyboardType="decimal-pad" onChangeText={(t) => { const n = parseFloat(t.replace(',', '.')); onChange(isNaN(n) ? 0 : Math.max(min, n)); }}
        style={[type.headline, { width: 44, textAlign: 'center', color: color.text }]} />
      <Pressable accessibilityLabel="أكتر" onPress={() => { tap(); onChange(Math.round((value + step) * 100) / 100); }} style={s.stepBtn}><T v="title3">+</T></Pressable>
    </View>
  );
}

/* ---------- sheet ---------- */
export function Sheet({ open, onClose, title, children, done }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; done?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: color.scrim }} onPress={onClose} accessibilityLabel="إغلاق" />
      <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, space.l) + space.s }]}>
        <View style={s.grab} />
        {title ? (
          <View style={s.sheetBar}>
            <Pressable onPress={onClose} accessibilityLabel="إغلاق" style={s.x}><X size={16} color={color.text2} strokeWidth={2.6} /></Pressable>
            <T v="headline">{title}</T>
            {done ? <Pressable onPress={onClose}><T v="headline" c={color.link}>{done}</T></Pressable> : <View style={{ width: 32 }} />}
          </View>
        ) : null}
        {children}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  nav: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xs },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center', ...shadow.e1, borderWidth: StyleSheet.hairlineWidth, borderColor: color.border },
  btn: { height: 54, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s, paddingHorizontal: space.xl },
  btnSmall: { height: 40, paddingHorizontal: space.l },
  btnOff: { backgroundColor: color.navy100, shadowOpacity: 0, elevation: 0, borderWidth: 0 },
  card: { backgroundColor: color.white, borderRadius: radius.card, padding: space.l, ...shadow.e1 },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: color.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.l, paddingVertical: space.s },
  field: { flexDirection: 'row', alignItems: 'center', gap: space.m, backgroundColor: color.white, borderRadius: radius.card, paddingHorizontal: space.l, minHeight: 54 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.navy50, borderRadius: radius.pill, height: 38 },
  stepBtn: { width: 40, height: 38, alignItems: 'center', justifyContent: 'center' },
  sheet: { backgroundColor: color.mist, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: GUTTER, paddingTop: space.s, maxHeight: '90%' },
  grab: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.navy100, marginBottom: space.s },
  sheetBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, marginBottom: space.s },
  x: { width: 32, height: 32, borderRadius: 16, backgroundColor: color.navy50, alignItems: 'center', justifyContent: 'center' },
});

export { font };
