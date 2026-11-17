'use client';
import Link from 'next/link';
import { useApp } from './Providers';
import { supabase } from '../lib/supabase';
export default function Nav() {
  const { profile, canEdit, editing, setEditing } = useApp();
  return (
    <nav>
      <Link href="/" className="logo">FLEET <b>CREATES</b></Link>
      <div className="links">
        <Link href="/">Home</Link><Link href="/#portfolio">Portfolio</Link><Link href="/#services">Services</Link>
        <Link href="/#about">About</Link><Link href="/#contact">Contact</Link>
      </div>
      <div className="right">
        {canEdit && <button className={editing ? 'btn red' : 'btn'} onClick={() => setEditing(!editing)}>{editing ? 'Done editing' : 'Edit site'}</button>}
        {profile ? (<><span className="who">{profile.username} · {profile.role}</span>
          <button className="btn" onClick={() => supabase.auth.signOut()}>Sign out</button></>) : (<>
          <Link className="btn" href="/auth">Sign In</Link><Link className="btn red" href="/auth?mode=up">Get Started</Link></>)}
      </div>
    </nav>
  );
}
