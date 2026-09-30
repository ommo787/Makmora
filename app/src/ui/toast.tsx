import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { color, radius, shadow, space } from '@/theme/tokens';

const useToastStore = create<{ node: ReactNode; key: number; show(n: ReactNode): void }>((set) => ({
  node: null, key: 0, show: (node) => set((s) => ({ node, key: s.key + 1 })),
}));
/** Show a short confirmation at the top ("انضافوا 2 ⃁ لمكمورة سليم"). */
export const toast = (node: ReactNode) => useToastStore.getState().show(node);

export function ToastHost() {
  const { node, key } = useToastStore();
  const a = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!key) return;
    a.setValue(0);
    Animated.sequence([
      Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6 }),
      Animated.delay(1700),
      Animated.timing(a, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [key, a]);
  if (!key) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', paddingTop: insets.top + space.s }]}>
      <Animated.View style={[st.box, { opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] }]}>
        {node}
      </Animated.View>
    </View>
  );
}
const st = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.s, backgroundColor: color.navy, paddingHorizontal: space.l, paddingVertical: space.s + 2, borderRadius: radius.pill, ...shadow.e3 },
});
