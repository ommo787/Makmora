import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SURPRISES, TASK_TEMPLATES, type AvatarKey } from '@/data/catalog';
import type { IconName } from '@/ui/icons';

export type TaskState = 'todo' | 'waiting' | 'done';
export type Task = {
  id: string;
  key?: string;            // ready-made template key, if any
  name: string;
  icon: IconName;
  did: string;             // "رتّب سريره": how the finished task reads
  reward: number;          // in the family currency
  days: boolean[];         // Saturday → Friday
};
export type Goal = { name: string; icon: IconName; amount: number };
export type Child = {
  id: string;
  name: string;
  age: number;
  avatar: AvatarKey;
  photo?: string;
  tasks: Task[];
  goal?: Goal;
  balance: number;
  today: Record<string, { state: TaskState; at?: number }>;   // task id → today's state
  approved: { taskId: string; at: number; reward: number }[]; // history of approvals
};
export type Parent = { name: string; role: 'بابا' | 'ماما'; avatar: AvatarKey; email?: string; via?: 'apple' | 'google' | 'email' };
export type Surprise = { key: string; title?: string; icon?: IconName; condition: 'all' | 'manual'; status: 'armed' | 'earned'; seenBy: string[] };

type Family = {
  onboarded: boolean;
  parent?: Parent;
  children: Child[];
  secured: boolean;                 // Face ID / passcode set at the first approval
  subscription: { status: 'none' | 'trial' | 'active'; plan?: 'year' | 'month'; startedAt?: number };
  surprise?: Surprise;
  invitedPartner?: string;
  familyCode: string;
  mode: 'parent' | 'child';         // what this device shows
  activeChildId?: string;           // on a child's device
};

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
  markDone(childId: string, taskId: string): void;      // the child taps "خلّصت"
  undoDone(childId: string, taskId: string): void;
  approve(childId: string, taskId: string): void;
  sendBack(childId: string, taskId: string): void;
  armSurprise(s: { key: string; title: string; icon: IconName }, condition: 'all' | 'manual'): void;
  seeSurprise(childId: string): void;
  clearSurprise(): void;
  invitePartner(email: string): void;
  setMode(mode: 'parent' | 'child', childId?: string): void;
  reset(): void;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const code = () => Array.from({ length: 6 }, () => '0123456789'[Math.floor(Math.random() * 10)]).join('');
const EVERY = () => Array(7).fill(true) as boolean[];

/** Ready-made tasks suggested for an age. */
export function suggestedTasks(age: number): Task[] {
  return TASK_TEMPLATES.filter((t) => age >= t.ages[0] && age <= t.ages[1]).map((t) => ({
    id: uid(), key: t.key, name: t.name, icon: t.icon, did: t.did, reward: t.reward, days: EVERY(),
  }));
}
export const templateToTask = (key: string): Task => {
  const t = TASK_TEMPLATES.find((x) => x.key === key)!;
  return { id: uid(), key: t.key, name: t.name, icon: t.icon, did: t.did, reward: t.reward, days: EVERY() };
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

const initial: Family = {
  onboarded: false, children: [], secured: false, subscription: { status: 'none' }, familyCode: code(), mode: 'parent',
};

const mapChild = (s: Family, id: string, f: (c: Child) => Child) => ({ children: s.children.map((c) => (c.id === id ? f(c) : c)) });

export const useFamily = create<Family & Actions>()(
  persist(
    (set) => ({
      ...initial,
      setParent: (p) => set({ parent: p }),
      addChild: ({ name, age, avatar, photo }) =>
        set((s) => ({ children: [...s.children, { id: uid(), name, age, avatar, photo, tasks: suggestedTasks(age), balance: 0, today: {}, approved: [] }] })),
      removeChild: (id) => set((s) => ({ children: s.children.filter((c) => c.id !== id) })),
      addTask: (childId, t) => set((s) => mapChild(s, childId, (c) => ({ ...c, tasks: [...c.tasks, { ...t, id: uid() }] }))),
      removeTask: (childId, taskId) => set((s) => mapChild(s, childId, (c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }))),
      updateTask: (childId, taskId, patch) =>
        set((s) => mapChild(s, childId, (c) => ({ ...c, tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }))),
      setGoal: (childId, goal) => set((s) => mapChild(s, childId, (c) => ({ ...c, goal }))),
      redeemGoal: (childId) =>
        set((s) => mapChild(s, childId, (c) => (c.goal ? { ...c, balance: Math.max(0, c.balance - c.goal.amount), goal: undefined } : c))),
      finishOnboarding: () => set({ onboarded: true }),
      startTrial: (plan) => set({ subscription: { status: 'trial', plan, startedAt: Date.now() }, onboarded: true }),
      setSecured: (v) => set({ secured: v }),
      markDone: (childId, taskId) =>
        set((s) => mapChild(s, childId, (c) => ({ ...c, today: { ...c.today, [taskId]: { state: 'waiting', at: Date.now() } } }))),
      undoDone: (childId, taskId) =>
        set((s) => mapChild(s, childId, (c) => ({ ...c, today: { ...c.today, [taskId]: { state: 'todo' } } }))),
      approve: (childId, taskId) =>
        set((s) => {
          const next = mapChild(s, childId, (c) => {
            const t = c.tasks.find((x) => x.id === taskId);
            if (!t || c.today[taskId]?.state !== 'waiting') return c;
            return {
              ...c, balance: c.balance + t.reward,
              today: { ...c.today, [taskId]: { state: 'done', at: Date.now() } },
              approved: [...c.approved, { taskId, at: Date.now(), reward: t.reward }],
            };
          });
          // a family surprise set for "everyone finished everything" is earned the moment it becomes true
          const sur = s.surprise;
          if (sur && sur.status === 'armed' && sur.condition === 'all') {
            const all = next.children.every((c) => c.tasks.length > 0 && c.tasks.every((t) => c.today[t.id]?.state === 'done'));
            if (all) return { ...next, surprise: { ...sur, status: 'earned' as const, seenBy: [] } };
          }
          return next;
        }),
      sendBack: (childId, taskId) =>
        set((s) => mapChild(s, childId, (c) => ({ ...c, today: { ...c.today, [taskId]: { state: 'todo' } } }))),
      armSurprise: ({ key, title, icon }, condition) =>
        set({ surprise: { key, title, icon, condition, status: condition === 'manual' ? 'earned' : 'armed', seenBy: [] } }),
      seeSurprise: (childId) =>
        set((s) => (s.surprise ? { surprise: { ...s.surprise, seenBy: [...new Set([...s.surprise.seenBy, childId])] } } : {})),
      clearSurprise: () => set({ surprise: undefined }),
      invitePartner: (email) => set({ invitedPartner: email }),
      setMode: (mode, childId) => set({ mode, activeChildId: childId }),
      reset: () => set({ ...initial, familyCode: code() }),
    }),
    { name: 'makmoura-family', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

/** A ready family for previews and demos. */
export function seedDemoFamily() {
  const s = useFamily.getState();
  s.reset();
  s.setParent({ name: 'أحمد الخطيب', role: 'بابا', avatar: 'man', via: 'apple' });
  s.addChild({ name: 'سليم', age: 9, avatar: 'boy' });
  s.addChild({ name: 'لؤي', age: 6, avatar: 'child' });
  const [salim, louai] = useFamily.getState().children;
  s.setGoal(salim.id, { name: 'بلاي ستيشن', icon: 'gamepad', amount: 300 });
  s.setGoal(louai.id, { name: 'علبة ألوان', icon: 'palette', amount: 40 });
  useFamily.setState((st) => ({
    onboarded: true,
    subscription: { status: 'trial', plan: 'year', startedAt: Date.now() },
    children: st.children.map((c, i) => {
      const t = c.tasks;
      const today: Child['today'] =
        i === 0
          ? { [t[0].id]: { state: 'done', at: Date.now() - 3600e3 }, [t[1].id]: { state: 'waiting', at: Date.now() - 10 * 60e3 }, [t[2].id]: { state: 'waiting', at: Date.now() - 25 * 60e3 } }
          : { [t[0].id]: { state: 'done', at: Date.now() - 3600e3 }, [t[1].id]: { state: 'done', at: Date.now() - 1800e3 }, [t[2].id]: { state: 'waiting', at: Date.now() - 5 * 60e3 } };
      return { ...c, today, balance: i === 0 ? 112 : 26 };
    }),
  }));
}
