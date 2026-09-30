import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { House, Settings, Users } from 'lucide-react-native';
import { forwardRef, type ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, radius, shadow, space } from '@/theme/tokens';
import { T } from '@/ui/kit';

type TabProps = TabTriggerSlotProps & { label: string; Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }> };
const TabButton = forwardRef<View, TabProps>(function TabButton({ label, Icon, isFocused, ...props }, ref) {
  const c = isFocused ? color.navy : color.text3;
  return (
    <Pressable ref={ref} {...props} style={st.tab} accessibilityRole="tab" accessibilityState={{ selected: isFocused }}>
      <View style={[st.pill, isFocused && { backgroundColor: color.gold100 }]}><Icon size={22} color={c} strokeWidth={isFocused ? 2.4 : 2} /></View>
      <T v="caption" c={c}>{label}</T>
    </Pressable>
  );
});

/** The parent's space: a floating tab bar (Today · Children · Settings). */
export default function ParentTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={[st.bar, { bottom: Math.max(insets.bottom, space.m) }]}>
        <TabTrigger name="today" href="/today" asChild><TabButton label="اليوم" Icon={House} /></TabTrigger>
        <TabTrigger name="kids" href="/kids" asChild><TabButton label="الأولاد" Icon={Users} /></TabTrigger>
        <TabTrigger name="settings" href="/settings" asChild><TabButton label="الإعدادات" Icon={Settings} /></TabTrigger>
      </TabList>
    </Tabs>
  );
}
const st = StyleSheet.create({
  bar: { position: 'absolute', start: 20, end: 20, height: 66, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.96)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: StyleSheet.hairlineWidth, borderColor: color.border, ...shadow.e3 },
  tab: { flex: 1, alignItems: 'center', gap: 1 },
  pill: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
