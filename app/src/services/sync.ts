import type { RealtimeChannel } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { supabase } from '@/services/supabase';
import { outbox, useFamily, type Ev, type Role } from '@/state/store';

/**
 * Keeps this device and the server in step.
 * Up: every event this device records goes to `events` (it stays in `pending` until the server has it).
 * Down: new events from the other devices arrive live, and a pull on start and on return fills any gap.
 */
let channel: RealtimeChannel | null = null;
let pushing = false;
let again = false;

type Row = { seq: number; payload: Ev };

/** Fetch every event after the last one this device has, in order. */
export async function pull() {
  const s = useFamily.getState();
  if (!supabase || !s.familyId) return;
  for (;;) {
    const { lastSeq, familyId } = useFamily.getState();
    const { data, error } = await supabase.from('events').select('seq,payload')
      .eq('family_id', familyId!).gt('seq', lastSeq).order('seq').limit(500);
    if (error || !data?.length) return;
    useFamily.getState().applyRemote((data as Row[]).map((r) => ({ seq: r.seq, ev: r.payload })));
    if (data.length < 500) return;
  }
}

/** Send what is waiting, oldest first. Stops at the first network failure and tries again later. */
export async function push() {
  if (!supabase) return;
  if (pushing) { again = true; return; }
  pushing = true;
  try {
    do {
      again = false;
      const { familyId, pending } = useFamily.getState();
      if (!familyId) return;
      for (const ev of pending) {
        const { error } = await supabase.from('events').insert({ family_id: familyId, type: ev.type, payload: ev });
        if (!error || error.code === '23505') continue;       // sent, or already there
        if (error.code === '42501') { useFamily.getState().reject(ev.eid); continue; }   // not allowed: drop it
        return;                                               // offline or server trouble: keep it for later
      }
      await pull();
    } while (again);
  } finally {
    pushing = false;
  }
}

/** Listen for the family's new events while the app is open. */
export function connect() {
  const { familyId } = useFamily.getState();
  if (!supabase || !familyId) return;
  if (channel) supabase.removeChannel(channel);
  channel = supabase.channel(`family:${familyId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: `family_id=eq.${familyId}` },
      (m) => { const r = m.new as Row; useFamily.getState().applyRemote([{ seq: r.seq, ev: r.payload }]); })
    .subscribe((status) => { if (status === 'SUBSCRIBED') { pull(); push(); } });
}

export function disconnect() {
  if (supabase && channel) supabase.removeChannel(channel);
  channel = null;
}

/** Start once at launch: send on every change, catch up whenever the app comes back. */
let started = false;
export function startSync() {
  if (!supabase || started) return;
  started = true;
  outbox.notify = () => { push(); };
  connect();
  AppState.addEventListener('change', (st) => { if (st === 'active') { pull().then(push); } });
}

/** A parent with a fresh account: make the family on the server and move this device's family into it. */
export async function createFamily(role: Role) {
  if (!supabase) return;
  const { data, error } = await supabase.rpc('create_family', { parent_role: role });
  if (error || !data) throw error ?? new Error('create_family');
  const f = data as { id: string; child_code: string; partner_code: string };
  const s = useFamily.getState();
  // an account that already had a family (a second phone) joins it instead of sending this device's copy
  const { count } = await supabase.from('events').select('seq', { count: 'exact', head: true }).eq('family_id', f.id);
  s.attach({ familyId: f.id, familyCode: f.child_code, partnerCode: f.partner_code, fresh: !!count && s.familyId !== f.id });
  connect();
  await push();
}

/** A child's tablet signs in without an account. */
async function ensureSession() {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
}

/** Who is in the family behind this code (names and looks only, for "مين إنت؟"). */
export async function peekFamily(code: string) {
  if (!supabase) return null;
  await ensureSession();
  const { data, error } = await supabase.rpc('peek_family', { code });
  if (error) throw error;
  return (data ?? []) as { child_id: string; name: string; avatar: string }[];
}

export async function joinAsChild(code: string, childId: string) {
  if (!supabase) return;
  await ensureSession();
  const { data: fid, error } = await supabase.rpc('join_as_child', { code, child: childId });
  if (error) throw error;
  const s = useFamily.getState();
  s.attach({ familyId: fid as string, familyCode: code, fresh: true });
  s.setMode('child', childId);
  connect();
  await pull();
}

export async function joinAsParent(code: string, role: Role) {
  if (!supabase) return;
  const { data: fid, error } = await supabase.rpc('join_as_parent', { code, parent_role: role });
  if (error) throw error;
  const s = useFamily.getState();
  s.attach({ familyId: fid as string, familyCode: '', partnerCode: code.toUpperCase(), fresh: true });
  connect();
  await pull();
  // tell the family the other parent is in; read the real child code now that we are a member
  const { data: fam } = await supabase.from('families').select('child_code').eq('id', fid as string).single();
  useFamily.setState({ familyCode: (fam as { child_code: string } | null)?.child_code ?? '' });
  const ev = { type: 'partnerJoined', eid: Math.random().toString(36).slice(2), at: Date.now(), by: role } as Ev;
  useFamily.setState((st) => ({ pending: [...st.pending, ev] }));
  await push();
}

export async function signOut() {
  disconnect();
  if (supabase) await supabase.auth.signOut();
  useFamily.getState().reset();
}

/** After signing in: if this account already belongs to a family (a new phone, or signing in again), load it. */
export async function restoreFamily(): Promise<boolean> {
  if (!supabase) return false;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { data } = await supabase.from('members').select('family_id,kind,role,child_id').eq('user_id', u.user.id).eq('kind', 'parent').limit(1);
  const m = data?.[0] as { family_id: string; role: Role | null } | undefined;
  if (!m) return false;
  const { data: fam } = await supabase.from('families').select('child_code,partner_code').eq('id', m.family_id).single();
  const f = fam as { child_code: string; partner_code: string } | null;
  const s = useFamily.getState();
  s.attach({ familyId: m.family_id, familyCode: f?.child_code ?? '', partnerCode: f?.partner_code, fresh: s.familyId !== m.family_id });
  if (!s.parent && m.role) s.setParent({ name: u.user.email ?? '', role: m.role, avatar: m.role === 'ماما' ? 'woman' : 'man', email: u.user.email ?? undefined, via: 'email' });
  useFamily.setState({ onboarded: true, mode: 'parent' });
  connect();
  await pull();
  return true;
}

/** Signed in but the family was never made on the server (for example the network dropped): make it now. */
export async function ensureFamily() {
  if (!supabase) return;
  const s = useFamily.getState();
  if (s.familyId || s.mode === 'child' || !s.parent) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session || data.session.user.is_anonymous) return;
  try { await createFamily(s.parent.role); } catch { /* try again next launch */ }
}
