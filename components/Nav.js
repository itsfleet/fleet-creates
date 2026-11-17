'use client';
import { useApp } from './Providers';
import { supabase } from '../lib/supabase';

export default function Nav() {
  const { user, ready, isOwner, editing, setEditing } = useApp();
  const name = user?.user_metadata?.username || user?.email?.split('@')[0] || '';

  async function signOut() {
    try { await supabase.auth.signOut(); } catch (e) {}
    window.location.href = '/';
  }

  return (
    <nav>
      <a className="logo" href="/">FLEET <b>CREATES</b></a>
      <div className="links">
        <a href="/">Home</a>
        <a href="/#portfolio">Portfolio</a>
        <a href="/#services">Services</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </div>
      <div className="right">
        {!ready ? null : user ? (
          <>
            <span className="who">{name}</span>
            {isOwner && (
              <button className={editing ? 'btn red' : 'btn'} onClick={() => setEditing(!editing)}>
                {editing ? 'Done editing' : 'Edit site'}
              </button>
            )}
            <a className="btn" href={isOwner ? '/admin' : '/orders'}>{isOwner ? 'Inbox' : 'My orders'}</a>
            <button className="btn" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <>
            <a className="btn" href="/auth">Sign In</a>
            <a className="btn red" href="/auth?mode=up">Get Started</a>
          </>
        )}
      </div>
    </nav>
  );
}
