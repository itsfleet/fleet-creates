'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
const Ctx = createContext({});
export const useApp = () => useContext(Ctx);
export default function Providers({ children }) {
  const [profile, setProfile] = useState(null);
  const [content, setContent] = useState({});
  const [editing, setEditing] = useState(false);
  async function loadProfile(session) {
    if (!session) { setProfile(null); setEditing(false); return; }
    const { data } = await supabase.from('profiles').select('username,role').eq('id', session.user.id).single();
    setProfile(data);
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => loadProfile(s));
    supabase.from('site_content').select('key,value').then(({ data }) =>
      setContent(Object.fromEntries((data || []).map((r) => [r.key, r.value]))));
    return () => sub.subscription.unsubscribe();
  }, []);
  // UI convenience only: the database (row-level security) is what actually blocks non-staff writes.
  const canEdit = profile?.role === 'owner' || profile?.role === 'admin';
  async function save(key, value) {
    const { error } = await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() });
    if (!error) setContent((c) => ({ ...c, [key]: value }));
    return !error;
  }
  return <Ctx.Provider value={{ profile, content, canEdit, editing, setEditing, save }}>{children}</Ctx.Provider>;
}
