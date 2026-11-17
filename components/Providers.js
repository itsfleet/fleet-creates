'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const OWNER_EMAIL = 'abdullahog126@users.fleetcreates.app';
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export default function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState({});
  const [contentReady, setContentReady] = useState(false);
  const [toast, setToast] = useState('');

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession()
      .then(({ data }) => { if (alive) setUser(data.session?.user ?? null); })
      .catch(() => {})
      .finally(() => { if (alive) setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setContentReady(true), 3000);
    supabase.from('site_content').select('key,value').then(
      ({ data, error }) => {
        if (!error && data) setContent(Object.fromEntries(data.map((r) => [r.key, r.value])));
        setContentReady(true);
      },
      () => setContentReady(true)
    );
    return () => clearTimeout(t);
  }, []);

  const saveContent = async (key, value) => {
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return error.message;
    setContent((c) => ({ ...c, [key]: value }));
    return null;
  };

  const isOwner = (user?.email || '').toLowerCase() === OWNER_EMAIL;

  return (
    <Ctx.Provider value={{ user, ready, isOwner, editing, setEditing, content, contentReady, saveContent, notify }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
