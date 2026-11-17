# FLEET CREATES — setup (about 10 minutes)

1. **Supabase:** create a free project at supabase.com.
2. **Sign-in settings:** Authentication > Providers > Email: turn OFF "Confirm email" (customers have no email). Keep sign-ups enabled.
3. **Database:** open `supabase/schema.sql`, check the owner username on the `insert into app_settings` line (it is set to `abdullahog126`; change it if you want another), paste into SQL Editor, Run.
4. **Keys:** Project Settings > API. Copy the URL and the `anon` public key into `.env.local` (see `.env.local.example`). Never use the `service_role` key in this project.
5. **Run:** `npm install` then `npm run dev`, open http://localhost:3000.
6. **Become owner:** go to Get Started and create an account with EXACTLY the owner username from step 3 (`abdullahog126` unless you changed it). Do this before the site is public. Only the first account with that username becomes owner.
7. **Edit the site:** sign in, click **Edit site**, click any dashed text, change it, click outside it to save. Click **Done editing**.
8. **Go public:** push the folder to GitHub, import it on vercel.com, add the two env vars, deploy.

## Admins
Owner can promote someone: Supabase > Table Editor > profiles > set `role` to `admin`. Admins can edit site text; only the owner can change roles.

## Forgotten passwords
No email, so reset them in Supabase > Authentication > Users (set a new password for `username@users.fleetcreates.app`).

## Security notes
Passwords are hashed by Supabase. Row-level security in the database blocks non-staff from changing content or roles, even if someone tampers with the page. Supabase rate-limits sign-in attempts.

## Not built yet
Orders, private chat, the full admin dashboard, portfolio uploads.
