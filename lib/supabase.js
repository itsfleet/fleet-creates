import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { lock: async (name, acquireTimeout, fn) => await fn() } }
);
// Customers only type a username. Supabase needs an email-shaped id, so we derive a private one.
export const toEmail = (u) => `${u.trim().toLowerCase()}@users.fleetcreates.app`;
