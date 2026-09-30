import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SURPRISES, TASK_TEMPLATES, type AvatarKey } from '@/data/catalog';
import type { IconName } from '@/ui/icons';

import {
  dayKey, emptyShared, reduce,
  type Child, type DayLog, type Ev, type Goal, type LateTask, type Role, type Shared, type Surprise, type Task,
} from './family';

export * from './family';

export type Parent = { name: string; role: Role; avatar: AvatarKey; photo?: string; email?: string; via?: 'apple' | 'google' | 'email' };

/** What only this device knows: who is holding it, and where it stands with the server. */
type Local = {
  onboarded: boolean;
  parent?: Parent;                  // the parent using this phone
  secured: boolean;
  invitedPartner?: string;
  familyCode: string;               // 6 digits for the children's devices
  partnerCode?: string;             // 8 letters for the other parent (from the server)
  familyId?: string;                // set once the family lives on the server
  invite?: { code: string; role: Role };   // opened an invite link: join that family after signing in
  mode: 'parent' | 'child';         // what this device shows
  activeChildId?: string;           // on a child's device
  base: Shared;                     // the family as the server confirmed it
  pending: Ev[];                    // what this device did that the server has not confirmed yet
  lastSeq: number;                  // the last server event applied to `base`
};
/** What the screens read: the confirmed family with this device's own unconfirmed changes on top. */
type Family = Local & Shared;

type Actions = {
  setParent(p: Parent): void;
  addChild(c: { name: string; age: number; avatar: AvatarKey; photo?: string }): void;
  removeChild(id: string): void;
  addTask(childId: string, t: Omit<Task, 'id'>): void;
  removeTask(childId: string, taskId: string): void;
  updateTask(childId: string, taskId: string, patch: Partial<Task>): void;
  setGoal(childId: string, goal?: Goal): void;
  redeemGoal(childId: string): void;                 // the parent bought the goal: take it out of the jar
  finishOnboarding(): void;
  startTrial(plan: 'year' | 'month'): void;
  setSecured(v: boolean): void;
  markDone(childId: string, taskId: string): void;   // the child taps a task
  undoDone(childId: string, taskId: string): void;
  approve(childId: string, taskId: string): void;
  approveLate(childId: string, lateId: string): void;
  dropLate(childId: string, lateId: string): void;
  celebrate(childId: string, kind: 'day' | 'goal'): void;
  rollover(): void;                                  // close yesterday at local midnight
  sendBack(childId: string, taskId: string): void;
  armSurprise(s: { key: string; title: string; icon: IconName }, condition: 'all' | 'manual'): void;
  seeSurprise(childId: string): void;
  clearSurprise(): void;
  invitePartner(email: string): void;
  setMode(mode: 'parent' | 'child', childId?: string): void;
  reset(): void;
  /** server side: apply events in the server's order */
  applyRemote(rows: { seq: number; ev: Ev }[]): void;
  /** server side: this device's family now lives on the server */
  attach(f: { familyId: string; familyCode: string; partnerCode?: string; fresh: boolean }): void;
  /** server side: drop a pending event the server refused for good */
  reject(eid: string): void;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const code = () => Array.from({ length: 6 }, () => '0123456789'[Math.floor(Math.random() * 10)]).join('');
const EVERY = () => Array(7).fill(true) as boolean[];

/** Ready-made tasks suggested for an age. */
export function suggestedTasks(age: number, girl = false): Task[] {
  return TASK_TEMPLATES.filter((t) => age >= t.ages[0] && age <= t.ages[1]).map((t) => ({
    id: uid(), key: t.key, name: t.name, icon: t.icon, did: girl ? t.didF : t.did, reward: t.reward, days: EVERY(),
  }));
}
export const templateToTask = (key: string, girl = false): Task => {
  const t = TASK_TEMPLATES.find((x) => x.key === key)!;
  return { id: uid(), key: t.key, name: t.name, icon: t.icon, did: girl ? t.didF : t.did, reward: t.reward, days: EVERY() };
};

/** What a surprise shows: its own title and icon, or the ready-made one it came from. */
export function surpriseInfo(s?: Surprise): { icon: IconName; title: string } | undefined {
  if (!s) return undefined;
  if (s.title && s.icon) return { title: s.title, icon: s.icon };
  return SURPRISES.find((x) => x.key === s.key) ?? { title: s.title ?? 'مفاجأة', icon: 'gift' };
}

/** Everything a child can earn in a day if all tasks are done. */
export const perDay = (c: Child) => c.tasks.reduce((a, t) => a + t.reward, 0);
export const waitingCount = (c: Child) => Object.values(c.today).filter((s) => s.state === 'waiting').length;
export const doneCount = (c: Child) => c.tasks.filter((t) => c.today[t.id]?.state === 'done').length;
export const earnedToday = (c: Child) => c.tasks.filter((t) => c.today[t.id]?.state === 'done').reduce((a, t) => a + t.reward, 0);

const visible = (base: Shared, pending: Ev[]): Shared => pending.reduce(reduce, base);
const initialLocal = (): Local => ({
  onboarded: false, secured: false, familyCode: code(), mode: 'parent', base: emptyShared(), pending: [], lastSeq: 0,
});

/** Called after this device records an event; the sync service hooks in here to send it. */
export const outbox = { notify: () => {} };

type Body = Ev extends infer E ? (E extends Ev ? Omit<E, 'eid' | 'at' | 'by'> : never) : never;

export const useFamily = create<Family & Actions>()(
  persist(
    (set, get) => {
      /** Record one change. On the server it waits in `pending` until confirmed; offline it is final at once. */
      const emit = (body: Body) => {
        const s = get();
        const ev = { ...body, eid: uid(), at: Date.now(), by: s.parent?.role } as Ev;
        if (s.familyId) {
          const pending = [...s.pending, ev];
          set({ pending, ...visible(s.base, pending) });
          outbox.notify();
        } else {
          const base = reduce(s.base, ev);
          set({ base, ...visible(base, s.pending) });
        }
      };
      const child = (id: string) => get().children.find((c) => c.id === id);
      return {
        ...initialLocal(),
        ...emptyShared(),
        setParent: (p) => set({ parent: p }),
        addChild: ({ name, age, avatar, photo }) => emit({ type: 'addChild', child: {
          id: uid(), name, age, avatar, photo, tasks: suggestedTasks(age, avatar === 'girl'), balance: 0, today: {}, approved: [], day: dayKey(), late: [], log: [],
        } }),
        removeChild: (childId) => emit({ type: 'removeChild', childId }),
        addTask: (childId, t) => emit({ type: 'addTask', childId, task: { ...t, id: uid() } }),
        removeTask: (childId, taskId) => emit({ type: 'removeTask', childId, taskId }),
        updateTask: (childId, taskId, patch) => emit({ type: 'updateTask', childId, taskId, patch }),
        setGoal: (childId, goal) => emit({ type: 'setGoal', childId, goal }),
        redeemGoal: (childId) => emit({ type: 'redeemGoal', childId }),
        finishOnboarding: () => set({ onboarded: true }),
        startTrial: (plan) => { set({ onboarded: true }); emit({ type: 'subscription', subscription: { status: 'trial', plan, startedAt: Date.now() } }); },
        setSecured: (v) => set({ secured: v }),
        markDone: (childId, taskId) => emit({ type: 'markDone', childId, taskId, date: dayKey() }),
        undoDone: (childId, taskId) => emit({ type: 'undoDone', childId, taskId, date: dayKey() }),
        approve: (childId, taskId) => emit({ type: 'approve', childId, taskId, date: child(childId)?.day ?? dayKey() }),
        approveLate: (childId, lateId) => emit({ type: 'approveLate', childId, lateId }),
        dropLate: (childId, lateId) => emit({ type: 'dropLate', childId, lateId }),
        sendBack: (childId, taskId) => emit({ type: 'sendBack', childId, taskId, date: child(childId)?.day ?? dayKey() }),
        celebrate: (childId, kind) => emit({ type: 'celebrate', childId, kind, value: kind === 'day' ? dayKey() : child(childId)?.goal?.name }),
        rollover: () => {
          const today = dayKey();
          if (get().children.some((c) => c.day && c.day < today)) emit({ type: 'rollover', date: today });
        },
        armSurprise: ({ key, title, icon }, condition) => emit({ type: 'armSurprise', surprise: {
          key, title, icon, condition, status: condition === 'manual' ? 'earned' : 'armed', seenBy: [],
        } }),
        seeSurprise: (childId) => emit({ type: 'seeSurprise', childId }),
        clearSurprise: () => emit({ type: 'clearSurprise' }),
        invitePartner: (email) => set({ invitedPartner: email }),
        setMode: (mode, childId) => set({ mode, activeChildId: childId }),
        reset: () => set({ ...initialLocal(), ...emptyShared(), parent: undefined, invitedPartner: undefined, partnerCode: undefined, familyId: undefined, activeChildId: undefined, invite: undefined }),
        applyRemote: (rows) => {
          const s = get();
          let { base, pending, lastSeq } = s;
          for (const { seq, ev } of [...rows].sort((a, b) => a.seq - b.seq)) {
            if (seq <= lastSeq) continue;
            base = reduce(base, ev);
            pending = pending.filter((p) => p.eid !== ev.eid);
            lastSeq = seq;
          }
          if (lastSeq !== s.lastSeq) set({ base, pending, lastSeq, ...visible(base, pending) });
        },
        attach: ({ familyId, familyCode, partnerCode, fresh }) => {
          const s = get();
          if (fresh) {
            // joining someone else's family: start empty and let the server fill it in
            set({ familyId, familyCode, partnerCode, base: emptyShared(), pending: [], lastSeq: 0, ...emptyShared() });
            return;
          }
          // this device made the family before it had an account: send it up as the first event
          const imp = { type: 'import', shared: s.base, eid: uid(), at: Date.now(), by: s.parent?.role } as Ev;
          const pending = s.familyId === familyId ? s.pending : [imp, ...s.pending];
          set({ familyId, familyCode, partnerCode, base: s.familyId === familyId ? s.base : emptyShared(), lastSeq: s.familyId === familyId ? s.lastSeq : 0, pending });
          outbox.notify();
        },
        reject: (eid) => {
          const s = get();
          const pending = s.pending.filter((p) => p.eid !== eid);
          set({ pending, ...visible(s.base, pending) });
        },
      };
    },
    {
      name: 'makmoura-family',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      // keep only what this device knows plus the confirmed family; the screen's copy is rebuilt on launch
      partialize: (s) => {
        const { children: _c, surprise: _s, subscription: _p, partnerJoined: _j, ...keep } = s;
        return Object.fromEntries(Object.entries(keep).filter(([, v]) => typeof v !== 'function')) as Partial<Family>;
      },
      merge: (saved, current) => {
        const m = { ...current, ...(saved as Partial<Family>) };
        return { ...m, ...visible(m.base ?? emptyShared(), m.pending ?? []) };
      },
      // version 1 kept the family's children at the top level
      migrate: (old, version) => {
        const o = (old ?? {}) as Record<string, unknown>;
        if (version < 2) {
          const base: Shared = {
            children: (o.children as Child[]) ?? [], surprise: o.surprise as Surprise | undefined,
            subscription: (o.subscription as Shared['subscription']) ?? { status: 'none' }, partnerJoined: o.partnerJoined as boolean | undefined,
          };
          return { ...o, base, pending: [], lastSeq: 0, ...base } as unknown as Family & Actions;
        }
        return o as unknown as Family & Actions;
      },
    },
  ),
);

/** A ready family for previews and demos. */
export function seedDemoFamily() {
  const s = useFamily.getState();
  s.reset();
  s.setParent({ name: 'أحمد الخطيب', role: 'بابا', avatar: 'man', via: 'apple' });
  s.addChild({ name: 'سليم', age: 9, avatar: 'boy' });
  s.addChild({ name: 'ميرا', age: 6, avatar: 'girl' });
  const [salim, mira] = useFamily.getState().children;
  s.setGoal(salim.id, { name: 'بلاي ستيشن', icon: 'gamepad', amount: 300 });
  s.setGoal(mira.id, { name: 'علبة ألوان', icon: 'palette', amount: 40 });
  const st = useFamily.getState();
  const base: Shared = {
    partnerJoined: true,
    subscription: { status: 'trial', plan: 'year', startedAt: Date.now() },
    children: st.children.map((c, i) => {
      const t = c.tasks;
      const today: Child['today'] =
        i === 0
          ? { [t[0].id]: { state: 'done', at: Date.now() - 3600e3, by: 'ماما' }, [t[1].id]: { state: 'waiting', at: Date.now() - 10 * 60e3 }, [t[2].id]: { state: 'waiting', at: Date.now() - 25 * 60e3 } }
          : { [t[0].id]: { state: 'done', at: Date.now() - 3600e3, by: 'بابا' }, [t[1].id]: { state: 'done', at: Date.now() - 1800e3, by: 'ماما' }, [t[2].id]: { state: 'waiting', at: Date.now() - 5 * 60e3 } };
      const past = (n: number) => dayKey(new Date(Date.now() - n * 864e5));
      const names = t.map((x) => x.name);
      const log: DayLog[] = [1, 2, 3, 4, 5, 6].map((n) => {
        const k = i === 0 ? [5, 6, 4, 6, 3, 6][n - 1] : [7, 5, 7, 6, 7, 4][n - 1];
        const done = names.slice(0, Math.min(k, names.length));
        return { date: past(n), done, planned: names.length, earned: t.filter((x) => done.includes(x.name)).reduce((a, x) => a + x.reward, 0) };
      });
      const late: LateTask[] = i === 0 ? [{ id: 'late1', taskId: t[3].id, name: t[3].name, did: t[3].did, icon: t[3].icon, reward: t[3].reward, date: past(1), at: Date.now() - 20 * 3600e3 }] : [];
      const approved = log.flatMap((d, n) => t.filter((x) => d.done.includes(x.name))
        .map((x, j) => ({ taskId: x.id, reward: x.reward, at: new Date(d.date + 'T19:00').getTime() - j * 60e3 - n, by: 'بابا' as const })));
      return { ...c, today, balance: i === 0 ? 112 : 26, day: dayKey(), log, late, approved };
    }),
  };
  useFamily.setState({ onboarded: true, invitedPartner: 'reem@icloud.com', base, pending: [], ...base });
}
