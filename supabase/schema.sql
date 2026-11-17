-- Run this once in Supabase > SQL Editor.
create table app_settings(owner_username text primary key);
insert into app_settings values ('abdullahog126');  -- owner username (lowercase). Change it before running if you want another.

create table profiles(
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  role text not null default 'customer' check (role in ('customer','admin','owner')),
  created_at timestamptz default now());
create table site_content(key text primary key, value text not null, updated_at timestamptz default now());

alter table app_settings enable row level security;   -- no policies = nobody can read it
alter table profiles enable row level security;
alter table site_content enable row level security;

create function is_staff() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role in ('admin','owner')) $$;
create function is_owner() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role='owner') $$;

create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare u text := lower(new.raw_user_meta_data->>'username'); r text := 'customer';
begin
  if u is null or u !~ '^[a-z0-9_]{3,20}$' then raise exception 'Invalid username'; end if;
  if new.email <> u || '@users.fleetcreates.app' then raise exception 'Invalid signup'; end if;
  if exists(select 1 from app_settings where owner_username=u)
     and not exists(select 1 from profiles where role='owner') then r := 'owner'; end if;
  insert into profiles(id,username,role) values(new.id,u,r);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create policy "own or staff reads profiles" on profiles for select using (id=auth.uid() or is_staff());
create policy "owner changes roles" on profiles for update using (is_owner()) with check (is_owner());
create policy "everyone reads content" on site_content for select using (true);
create policy "staff adds content" on site_content for insert with check (is_staff());
create policy "staff edits content" on site_content for update using (is_staff()) with check (is_staff());
