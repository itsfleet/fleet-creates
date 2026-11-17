'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../components/Providers';

export default function Chat() {
  const { id } = useParams();
  const { user, ready, isOwner } = useApp();
  const uid = user?.id;
  const [order, setOrder] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [urls, setUrls] = useState({});
  const asked = useRef(new Set());
  const box = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!ready) return;
    if (!uid) { window.location.href = `/auth?next=/orders/${id}`; return; }
    const refresh = async () => {
      const [o, m] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).maybeSingle(),
        supabase.from('messages').select('*').eq('order_id', id).order('created_at'),
      ]);
      if (o.error || !o.data) { setErr('Order not found.'); return; }
      setOrder(o.data);
      if (!m.error) setMsgs(m.data);
    };
    refresh();
    const t = setInterval(refresh, 5000);
    const ch = supabase
      .channel('order-' + id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${id}` },
        (p) => setMsgs((x) => (x.some((i) => i.id === p.new.id) ? x : [...x, p.new])))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (p) => setOrder(p.new))
      .subscribe();
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [ready, uid, id]);

  useEffect(() => {
    msgs.forEach((m) => {
      if (!m.file_path || asked.current.has(m.file_path)) return;
      asked.current.add(m.file_path);
      supabase.storage.from('deliveries').createSignedUrl(m.file_path, 3600).then(({ data }) => {
        if (data) setUrls((u) => ({ ...u, [m.file_path]: data.signedUrl }));
      });
    });
  }, [msgs]);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs.length]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setErr('');
    const { data, error } = await supabase
      .from('messages').insert({ order_id: id, sender_id: uid, body }).select().single();
    setSending(false);
    if (error) return setErr(error.message);
    setText('');
    setMsgs((x) => (x.some((i) => i.id === data.id) ? x : [...x, data]));
  }

  async function upload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setErr('File is too large (max 10 MB).');
    setSending(true);
    setErr('');
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${id}/${Date.now()}-${safe}`;
    const up = await supabase.storage.from('deliveries').upload(path, file);
    if (up.error) { setSending(false); return setErr(up.error.message); }
    const { data, error } = await supabase
      .from('messages').insert({ order_id: id, sender_id: uid, file_path: path }).select().single();
    setSending(false);
    if (error) return setErr(error.message);
    setMsgs((x) => (x.some((i) => i.id === data.id) ? x : [...x, data]));
  }

  async function setStatus(status) {
    setErr('');
    const { data, error } = await supabase
      .from('orders').update({ status }).eq('id', id).select().single();
    if (error) return setErr(error.message);
    setOrder(data);
  }

  function renderFile(m) {
    const url = urls[m.file_path];
    const name = m.file_path.split('/').pop().replace(/^\d+-/, '');
    const isImg = /\.(png|jpe?g|webp|gif)$/i.test(name);
    if (!url) return <div className="bubble mute">Loading file…</div>;
    return (
      <div className="bubble">
        {isImg && <img src={url} alt={name} />}
        <a className="btn" href={url} target="_blank" rel="noreferrer" download={name}>Download {name}</a>
      </div>
    );
  }

  if (!order) {
    return (
      <main className="wrap">
        {err ? <><p className="err">{err}</p><a className="btn" href="/orders">Back</a></> : <p className="mute">Loading…</p>}
      </main>
    );
  }

  const closed = order.status === 'closed';
  return (
    <main className="wrap chatwrap">
      <div className="chathead">
        <div>
          <a className="mute" href={isOwner ? '/admin' : '/orders'}>← Back</a>
          <h2>{order.plan}</h2>
          <p className="mute">{order.username} · {closed ? 'Closed' : 'Open'}</p>
        </div>
        {isOwner && (
          <button className={closed ? 'btn red' : 'btn'} onClick={() => setStatus(closed ? 'open' : 'closed')}>
            {closed ? 'Reopen order' : 'Close order'}
          </button>
        )}
      </div>

      <div className="chat" ref={box}>
        {msgs.length === 0 && <p className="mute">No messages yet. Describe the thumbnail you want and attach any reference images.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={m.sender_id === uid ? 'msg me' : 'msg'}>
            <small>{m.sender_id === order.user_id ? order.username : 'FLEET CREATES'} · {new Date(m.created_at).toLocaleString()}</small>
            {m.body && <div className="bubble">{m.body}</div>}
            {m.file_path && renderFile(m)}
          </div>
        ))}
      </div>

      {err && <p className="err">{err}</p>}
      {closed && !isOwner ? (
        <p className="mute">This order is closed. Start a new order if you need more work.</p>
      ) : (
        <form className="send" onSubmit={send}>
          <input className="grow" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" />
          <input ref={fileRef} type="file" hidden onChange={upload} />
          <button type="button" className="btn" onClick={() => fileRef.current.click()} disabled={sending}>Attach</button>
          <button className="btn red" disabled={sending}>Send</button>
        </form>
      )}
    </main>
  );
}
