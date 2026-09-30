import { useEffect, useRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, Modal, StyleSheet, View } from 'react-native';

import { play } from '@/services/sound';
import { success } from '@/services/haptics';
import { color, radius, space } from '@/theme/tokens';
import { Button, Glyph, T } from '@/ui/kit';
import type { IconName } from '@/ui/icons';

const COLORS = [color.gold, color.gold300, color.white, color.navy300];
const PIECES = 26;

/** Gold confetti falling once, behind the message. Skipped when the phone asks for less motion. */
function Confetti() {
  const { width, height } = Dimensions.get('window');
  const fall = useRef(Array.from({ length: PIECES }, () => new Animated.Value(0))).current;
  const spec = useRef(Array.from({ length: PIECES }, (_, i) => ({
    x: Math.random() * width, delay: Math.random() * 500, turn: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
    w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, c: COLORS[i % COLORS.length], drift: (Math.random() - 0.5) * 80,
  }))).current;
  useEffect(() => {
    let off = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || off) return;
      Animated.parallel(fall.map((v, i) => Animated.timing(v, {
        toValue: 1, duration: 2200 + Math.random() * 900, delay: spec[i].delay, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }))).start();
    }).catch(() => {});
    return () => { off = true; };
  }, [fall, spec]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {fall.map((v, i) => {
        const s = spec[i];
        return (
          <Animated.View key={i} style={{
            position: 'absolute', left: s.x, top: -30, width: s.w, height: s.h, borderRadius: 2, backgroundColor: s.c,
            opacity: v.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.8] }) },
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, s.drift] }) },
              { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${s.turn}deg`] }) },
            ],
          }} />
        );
      })}
    </View>
  );
}

/** A big moment for the child: all tasks done today, or the goal reached. One message, one button. */
export function Celebrate({ open, icon, title, sub, badge, button, onClose }:
  { open: boolean; icon: IconName; title: string; sub: string; badge?: ReactNode; button: string; onClose: () => void }) {
  const pop = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    if (!open) return;
    play('celebrate');
    success();
    pop.setValue(0.6);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 14 }).start();
  }, [open, pop]);
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.bg}>
        {open ? <Confetti /> : null}
        <Animated.View style={[st.halo, { transform: [{ scale: pop }] }]}>
          <Glyph name={icon} size={112} tone="gold" />
        </Animated.View>
        <T v="largeTitle" c={color.white} center style={{ marginTop: space.l }}>{title}</T>
        <T v="callout" c={color.navy300} center>{sub}</T>
        {badge ? <View style={st.badge}>{badge}</View> : null}
        <Button title={button} style={{ marginTop: space.xxl, alignSelf: 'stretch' }} onPress={onClose} />
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  bg: { flex: 1, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.m, overflow: 'hidden' },
  halo: { width: 168, height: 168, borderRadius: 84, backgroundColor: 'rgba(236,172,78,0.18)', alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: color.white, borderRadius: radius.card, paddingHorizontal: space.xl, paddingVertical: space.m, marginTop: space.s },
});
