import { router } from 'expo-router';
import { Lock, PartyPopper } from 'lucide-react-native';
import { Modal, Pressable, View } from 'react-native';

import { confirmParent } from '@/services/biometrics';
import { useFamily, surpriseInfo } from '@/state/store';
import { color, radius, space } from '@/theme/tokens';
import { ChildView } from '@/ui/child-view';
import { Button, Glyph, Screen, T } from '@/ui/kit';
import { toast } from '@/ui/toast';

/** The child's device: one screen, no tabs. Tap a task when it's done; a parent approves it. */
export default function ChildHome() {
  const { children, activeChildId, markDone, undoDone, parent, surprise, seeSurprise, setMode } = useFamily();
  const child = children.find((c) => c.id === activeChildId);
  if (!child) return null;
  const sur = surpriseInfo(surprise);
  const toParents = async () => { if (await confirmParent('لوحة الأهل')) { setMode('parent'); router.replace('/today'); } };
  const reveal = !!sur && surprise?.status === 'earned' && !surprise.seenBy.includes(child.id);
  return (
    <Screen bg={color.white}>
      <View style={{ marginTop: space.l }}>
        <ChildView child={child} headerEnd={
          <Pressable accessibilityRole="button" accessibilityLabel="لوحة الأهل" onPress={toParents}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: color.navy50 }, pressed && { opacity: 0.7 }]}>
            <Lock size={14} color={color.navy} strokeWidth={2.4} /><T v="footnote" c={color.navy}>للأهل</T>
          </Pressable>
        } onTask={(id, state) => {
          if (state === 'todo') { markDone(child.id, id); toast(<T v="subhead" c={color.white}>{`برافو! بعتناها لـ${parent?.role ?? 'بابا'}`}</T>); }
          else if (state === 'waiting') undoDone(child.id, id);
        }} />
      </View>
      {sur && surprise?.status === 'earned' && !reveal ? (
        <View style={{ marginTop: space.xl, backgroundColor: color.gold50, borderRadius: radius.card, padding: space.l, flexDirection: 'row', alignItems: 'center', gap: space.m }}>
          <Glyph name={sur.icon} size={52} tone="gold" />
          <View style={{ flex: 1 }}><T v="footnote" c={color.gold700}>مفاجأة اليوم</T><T v="title3">{sur.title}</T><T v="footnote" c={color.text2}>أنجزناها سوا</T></View>
        </View>
      ) : null}

      <Modal visible={reveal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.m }}>
          <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(236,172,78,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            {sur ? <Glyph name={sur.icon} size={110} tone="gold" /> : null}
          </View>
          <T v="largeTitle" c={color.white} center style={{ marginTop: space.l }}>مفاجأة اليوم!</T>
          <T v="callout" c={color.navy300} center>{surprise?.condition === 'all' ? 'لأنكم خلّصتوا كل مهامكم سوا' : 'مفاجأة من ماما وبابا، لأنكم أبطال'}</T>
          <View style={{ backgroundColor: color.white, borderRadius: radius.card, paddingHorizontal: space.xl, paddingVertical: space.m, marginTop: space.s }}><T v="title">{sur?.title ?? ''}</T></View>
          <Button title="يا سلام!" icon={<PartyPopper size={20} color={color.navy} />} style={{ marginTop: space.xxl, alignSelf: 'stretch' }} onPress={() => seeSurprise(child.id)} />
        </View>
      </Modal>
    </Screen>
  );
}
