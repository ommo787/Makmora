import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { useFamily } from '@/state/store';

/** Sends each device to the right place: sign-up, the parent's day, or the child's screen. */
export default function Index() {
  const [ready, setReady] = useState(useFamily.persist.hasHydrated());
  useEffect(() => useFamily.persist.onFinishHydration(() => setReady(true)), []);
  const { onboarded, mode, activeChildId } = useFamily();
  if (!ready) return null;
  if (mode === 'child' && activeChildId) return <Redirect href="/child/home" />;
  if (!onboarded) return <Redirect href="/welcome" />;
  return <Redirect href="/today" />;
}
