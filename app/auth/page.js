'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, toEmail } from '../../lib/supabase';
export default function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState('in');
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (new URLSearchParams(location.search).get('mode') === 'up') setMode('up'); }, []);
  async function submit(e) {
    e.preventDefault(); setErr('');
    const name = u.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(name)) return setErr('Username: 3–20 letters, numbers or underscores.');
    if (p.length < 8) return setErr('Password must be at least 8 characters.');
    setBusy(true);
    const email = toEmail(name);
    const { error } = mode === 'up'
      ? await supabase.auth.signUp({ email, password: p, options: { data: { username: name } } })
      : await supabase.auth.signInWithPassword({ email, password: p });
    setBusy(false);
    if (error) return setErr(mode === 'in' ? 'Wrong username or password.' : 'Could not create the account. That username may be taken.');
    router.push('/');
  }
  return (
    <main className="authwrap"><form className="card" onSubmit={submit}>
      <div className="tabs">
        <button type="button" className={mode === 'in' ? 'chip on' : 'chip'} onClick={() => setMode('in')}>Sign in</button>
        <button type="button" className={mode === 'up' ? 'chip on' : 'chip'} onClick={() => setMode('up')}>Create account</button>
      </div>
      <label>Username<input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required /></label>
      <label>Password<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} required /></label>
      {err && <p className="err">{err}</p>}
      <button className="btn red" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
    </form></main>
  );
}
