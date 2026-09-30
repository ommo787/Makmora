import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { seedDemoFamily, useFamily } from '@/state/store';

/** Opens the app with a ready family (for previews and screenshots): /demo, /demo?as=child, /demo?fresh=1 */
export default function Demo() {
  const { as, fresh } = useLocalSearchParams<{ as?: string; fresh?: string }>();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (fresh) useFamily.getState().reset();
    else {
      seedDemoFamily();
      if (as === 'child') useFamily.getState().setMode('child', useFamily.getState().children[0]?.id);
    }
    setDone(true);
  }, [as, fresh]);
  if (!done) return null;
  return <Redirect href={fresh ? '/welcome' : as === 'child' ? '/child/home' : '/today'} />;
}
