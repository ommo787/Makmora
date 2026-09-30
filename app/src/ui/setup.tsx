import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { useFamily } from '@/state/store';
import { space } from '@/theme/tokens';
import { ChildChip } from '@/ui/brand';
import { NavBar, Progress } from '@/ui/kit';

export type Stage = 'tasks' | 'rewards' | 'goal';
const STAGES: Stage[] = ['tasks', 'rewards', 'goal'];

/** Where a setup screen sits in the whole flow, and where "next" goes. */
export function useSetup(childId: string, stage: Stage) {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';   // opened from a child's page to change one thing
  const children = useFamily((s) => s.children);
  const i = Math.max(0, children.findIndex((c) => c.id === childId));
  const child = children[i];
  const total = children.length * 3 + 1;
  const step = i * 3 + STAGES.indexOf(stage) + 1;
  const nextChild = children[i + 1];
  const go = () => {
    if (editing) return router.back();
    if (stage === 'tasks') router.push(`/setup/${childId}/rewards`);
    else if (stage === 'rewards') router.push(`/setup/${childId}/goal`);
    else if (nextChild) router.push(`/setup/${nextChild.id}/tasks`);
    else router.push('/setup/all-set');
  };
  return { child, progress: step / total, nextChild, go, editing };
}

/** Progress bar, back button and the child chip at the top of each setup screen. */
export function SetupHeader({ progress, childId, editing }: { progress: number; childId: string; editing?: boolean }) {
  const child = useFamily((s) => s.children.find((c) => c.id === childId));
  return (
    <View style={{ gap: space.s }}>
      {!editing ? <View style={{ marginTop: space.s }}><Progress value={progress} height={4} /></View> : null}
      <NavBar end={child ? <ChildChip child={child} /> : null} />
    </View>
  );
}
