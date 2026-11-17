'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../components/Providers';

const PLANS = ['Standard', 'Pro', 'Channel pack'];

export default function Orders() {
  const { user, ready, isOwner } = useApp();
  const [orders, setOrders] = useState(null);
  const [plan, setPlan] = useState(PLANS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const uid = user?.id;

  useEffect(() => {
    if (!ready) return;
    if (!uid) { window.location.href = '/auth?mode=up&next=/orders'; return; }
    if (isOwner) { window.location.href = '/admin'; return; }
    supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setOrders(data);
      });
  }, [ready, uid, isOwner]);

  async function start() {
    setBusy(true);
    setErr('');
    const username = user.user_metadata?.username || user.email.split('@')[0];
    const { data, error } = await supabase
      .from('orders')
      .insert({ user_id: uid, username, plan })
      .select()
      .single();
    setBusy(false);
    if (error) return setErr(error.message);
    window.location.href = `/orders/${data.id}`;
  }

  if (!ready || !uid || isOwner) return <main className="wrap"><p className="mute">Loading…</p></main>;

  return (
    <main className="wrap">
      <h2>My orders</h2>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Start a new order</h3>
        <div className="row">
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLANS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button className="btn red" onClick={start} disabled={busy}>{busy ? 'Please wait…' : 'Start order'}</button>
        </div>
        {err && <p className="err">{err}</p>}
      </div>
      <div className="grid">
        {orders === null && !err && <p className="mute">Loading…</p>}
        {orders && orders.length === 0 && <p className="mute">No orders yet. Start your first one above.</p>}
        {orders && orders.map((o) => (
          <a key={o.id} className="card order" href={`/orders/${o.id}`}>
            <div>
              <h3>{o.plan}</h3>
              <p>{new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`badge ${o.status}`}>{o.status === 'open' ? 'Open' : 'Closed'}</span>
          </a>
        ))}
      </div>
    </main>
  );
}
