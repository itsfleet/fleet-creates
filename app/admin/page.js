'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../components/Providers';

export default function Admin() {
  const { user, ready, isOwner } = useApp();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('open');
  const [err, setErr] = useState('');
  const uid = user?.id;

  useEffect(() => {
    if (!ready) return;
    if (!uid) { window.location.href = '/auth?next=/admin'; return; }
    if (!isOwner) { window.location.href = '/'; return; }
    const load = async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) setErr(error.message);
      else { setErr(''); setOrders(data); }
    };
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [ready, uid, isOwner]);

  if (!ready || !isOwner) return <main className="wrap"><p className="mute">Loading…</p></main>;

  const count = (s) => orders.filter((o) => o.status === s).length;
  const shown = orders.filter((o) => o.status === tab);

  return (
    <main className="wrap">
      <h2>Inbox</h2>
      <div className="tabs" style={{ maxWidth: 360, marginBottom: 20 }}>
        <button className={tab === 'open' ? 'chip on' : 'chip'} onClick={() => setTab('open')}>Open ({count('open')})</button>
        <button className={tab === 'closed' ? 'chip on' : 'chip'} onClick={() => setTab('closed')}>Closed ({count('closed')})</button>
      </div>
      {err && <p className="err">{err}</p>}
      <div className="grid">
        {shown.length === 0 && <p className="mute">No {tab} orders.</p>}
        {shown.map((o) => (
          <a key={o.id} className="card order" href={`/orders/${o.id}`}>
            <div>
              <h3>{o.username}</h3>
              <p>{o.plan} · {new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`badge ${o.status}`}>{o.status === 'open' ? 'Open' : 'Closed'}</span>
          </a>
        ))}
      </div>
    </main>
  );
}
