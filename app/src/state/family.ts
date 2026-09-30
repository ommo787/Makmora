/**
 * The family, as every device sees it.
 *
 * Everything that changes the family is an event. Every device applies the same events in the same
 * order (the server's order), so the parents' phones and the children's tablets always agree.
 * `reduce` must stay pure: ids, times and dates travel inside the event, never from the device clock.
 */
import type { AvatarKey } from '@/data/catalog';
import type { IconName } from '@/ui/icons';

export type Role = 'بابا' | 'ماما';
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
/** A task the child finished on an earlier day that no parent approved before midnight. It is never lost. */
export type LateTask = { id: string; taskId: string; name: string; did: string; icon: IconName; reward: number; date: string; at?: number };
/** What a day looked like once it closed. */
export type DayLog = { date: string; done: string[]; planned: number; earned: number };
export type Child = {
  id: string;
  name: string;
  age: number;
  avatar: AvatarKey;
  photo?: string;
  tasks: Task[];
  goal?: Goal;
  balance: number;
  today: Record<string, { state: TaskState; at?: number; by?: Role }>;   // task id → today's state
  approved: { taskId: string; at: number; reward: number; by?: Role }[]; // history of approvals
  day?: string;                                          // which day `today` belongs to (YYYY-MM-DD, local)
  late?: LateTask[];                                     // finished on an earlier day, still waiting for a parent
  log?: DayLog[];                                        // one line per past day, newest first (last 60 days)
  celebrated?: { day?: string; goal?: string };          // so each celebration shows once
};
export type Surprise = { key: string; title?: string; icon?: IconName; condition: 'all' | 'manual'; status: 'armed' | 'earned'; seenBy: string[] };
export type Subscription = { status: 'none' | 'trial' | 'active'; plan?: 'year' | 'month'; startedAt?: number };

/** The part of the family every device shares. */
export type Shared = {
  children: Child[];
  surprise?: Surprise;
  subscription: Subscription;
  partnerJoined?: boolean;          // the other parent joined: same rights, free under the one family subscription
};
export const emptyShared = (): Shared => ({ children: [], subscription: { status: 'none' } });

type Body =
  | { type: 'import'; shared: Shared }                     // a family made on this device before it had an account
  | { type: 'addChild'; child: Child }
  | { type: 'removeChild'; childId: string }
  | { type: 'addTask'; childId: string; task: Task }
  | { type: 'removeTask'; childId: string; taskId: string }
  | { type: 'updateTask'; childId: string; taskId: string; patch: Partial<Task> }
  | { type: 'setGoal'; childId: string; goal?: Goal }
  | { type: 'redeemGoal'; childId: string }
  | { type: 'markDone'; childId: string; taskId: string; date: string }
  | { type: 'undoDone'; childId: string; taskId: string; date: string }
  | { type: 'approve'; childId: string; taskId: string; date: string }
  | { type: 'sendBack'; childId: string; taskId: string; date: string }
  | { type: 'approveLate'; childId: string; lateId: string }
  | { type: 'dropLate'; childId: string; lateId: string }
  | { type: 'celebrate'; childId: string; kind: 'day' | 'goal'; value?: string }
  | { type: 'rollover'; date: string }
  | { type: 'armSurprise'; surprise: Surprise }
  | { type: 'seeSurprise'; childId: string }
  | { type: 'clearSurprise' }
  | { type: 'subscription'; subscription: Subscription }
  | { type: 'partnerJoined' };
/** `eid` makes an event unique so a device can recognise its own events coming back from the server. */
export type Ev = Body & { eid: string; at: number; by?: Role };
export type EvType = Ev['type'];
/** What a child's own device may send. Everything else needs a parent. */
export const CHILD_EVENTS: EvType[] = ['markDone', 'undoDone', 'celebrate', 'seeSurprise', 'rollover'];

/** Local calendar day, so a new day starts at midnight where the family lives. */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const planned = (c: Child, date: string) => { const w = (new Date(date + 'T12:00').getDay() + 1) % 7; return c.tasks.filter((t) => t.days[w]).length; };
const lateId = (taskId: string, date: string) => `${taskId}@${date}`;

/** Close the child's day up to `date`: log what was done, carry what still waits, start fresh. */
export function closeDay(c: Child, date: string): Child {
  if (!c.day) return { ...c, day: date };
  if (c.day >= date) return c;
  const done = c.tasks.filter((t) => c.today[t.id]?.state === 'done');
  const waiting: LateTask[] = c.tasks.filter((t) => c.today[t.id]?.state === 'waiting')
    .map((t) => ({ id: lateId(t.id, c.day!), taskId: t.id, name: t.name, did: t.did, icon: t.icon, reward: t.reward, date: c.day!, at: c.today[t.id]?.at }));
  const entry: DayLog = { date: c.day, done: done.map((t) => t.name), planned: planned(c, c.day), earned: done.reduce((a, t) => a + t.reward, 0) };
  const late = [...(c.late ?? []).filter((l) => !waiting.some((w) => w.id === l.id)), ...waiting];
  return { ...c, day: date, today: {}, late, log: [entry, ...(c.log ?? []).filter((d) => d.date !== entry.date)].slice(0, 60) };
}

const setToday = (c: Child, taskId: string, v: Child['today'][string]) => ({ ...c, today: { ...c.today, [taskId]: v } });
const withLog = (c: Child, date: string, name: string, reward: number) =>
  (c.log ?? []).map((d) => (d.date === date ? { ...d, done: [...d.done, name], earned: d.earned + reward } : d));

function approveLate(c: Child, id: string, at: number, by?: Role): Child {
  const l = c.late?.find((x) => x.id === id);
  if (!l) return c;
  return {
    ...c, balance: c.balance + l.reward, late: c.late!.filter((x) => x.id !== id),
    approved: [...c.approved, { taskId: l.taskId, at, reward: l.reward, by }], log: withLog(c, l.date, l.name, l.reward),
  };
}

/** Apply one event to a child, bringing the child's day forward first when the event is from a newer day. */
function onChild(c: Child, e: Ev): Child {
  const date = 'date' in e ? e.date : undefined;
  if (date && c.day && date > c.day) c = closeDay(c, date);
  const old = !!date && !!c.day && date < c.day;       // the event belongs to a day this child already closed
  switch (e.type) {
    case 'addTask': return { ...c, tasks: [...c.tasks.filter((t) => t.id !== e.task.id), e.task] };
    case 'removeTask': return { ...c, tasks: c.tasks.filter((t) => t.id !== e.taskId) };
    case 'updateTask': return { ...c, tasks: c.tasks.map((t) => (t.id === e.taskId ? { ...t, ...e.patch, id: t.id } : t)) };
    case 'setGoal': return { ...c, goal: e.goal };
    case 'redeemGoal': return c.goal ? { ...c, balance: Math.max(0, c.balance - c.goal.amount), goal: undefined } : c;
    case 'markDone': {
      const t = c.tasks.find((x) => x.id === e.taskId);
      if (!t) return c;
      if (old) {
        const id = lateId(t.id, e.date);
        if (c.late?.some((l) => l.id === id)) return c;
        return { ...c, late: [...(c.late ?? []), { id, taskId: t.id, name: t.name, did: t.did, icon: t.icon, reward: t.reward, date: e.date, at: e.at }] };
      }
      return c.today[t.id]?.state === 'done' ? c : setToday(c, t.id, { state: 'waiting', at: e.at });
    }
    case 'undoDone':
    case 'sendBack':
      if (old) return { ...c, late: (c.late ?? []).filter((l) => l.id !== lateId(e.taskId, e.date)) };
      return c.today[e.taskId]?.state === 'waiting' ? setToday(c, e.taskId, { state: 'todo' }) : c;
    case 'approve': {
      if (old) return approveLate(c, lateId(e.taskId, e.date), e.at, e.by);
      const t = c.tasks.find((x) => x.id === e.taskId);
      if (!t || c.today[t.id]?.state !== 'waiting') return c;
      return {
        ...setToday(c, t.id, { state: 'done', at: e.at, by: e.by }), balance: c.balance + t.reward,
        approved: [...c.approved, { taskId: t.id, at: e.at, reward: t.reward, by: e.by }],
      };
    }
    case 'approveLate': return approveLate(c, e.lateId, e.at, e.by);
    case 'dropLate': return { ...c, late: (c.late ?? []).filter((x) => x.id !== e.lateId) };
    case 'celebrate': return { ...c, celebrated: { ...c.celebrated, [e.kind]: e.value } };
    default: return c;
  }
}

/** The one rule book. Same events in, same family out, on every device. */
export function reduce(s: Shared, e: Ev): Shared {
  switch (e.type) {
    case 'import': return e.shared;
    case 'addChild': return s.children.some((c) => c.id === e.child.id) ? s : { ...s, children: [...s.children, e.child] };
    case 'removeChild': return { ...s, children: s.children.filter((c) => c.id !== e.childId) };
    case 'rollover': return { ...s, children: s.children.map((c) => closeDay(c, e.date)) };
    case 'armSurprise': return { ...s, surprise: e.surprise };
    case 'seeSurprise':
      return s.surprise ? { ...s, surprise: { ...s.surprise, seenBy: [...new Set([...s.surprise.seenBy, e.childId])] } } : s;
    case 'clearSurprise': return { ...s, surprise: undefined };
    case 'subscription': return { ...s, subscription: e.subscription };
    case 'partnerJoined': return { ...s, partnerJoined: true };
    default: {
      if (!('childId' in e)) return s;
      const next = { ...s, children: s.children.map((c) => (c.id === e.childId ? onChild(c, e) : c)) };
      // a family surprise set for "everyone finished everything" is earned the moment it becomes true
      const sur = next.surprise;
      if (e.type === 'approve' && sur && sur.status === 'armed' && sur.condition === 'all') {
        const all = next.children.every((c) => c.tasks.length > 0 && c.tasks.every((t) => c.today[t.id]?.state === 'done'));
        if (all) return { ...next, surprise: { ...sur, status: 'earned', seenBy: [] } };
      }
      return next;
    }
  }
}
