-- Supabase schema for Anonimax
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  anonimax_id text unique not null,
  nick text not null,
  session_id text not null,
  polygon_address text,
  avatar text,
  since date default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  price numeric(12,2) not null default 0,
  contact_session text not null,
  polygon_address text,
  anonimax_id text,
  emoji text,
  created_at timestamptz not null default now(),
  constraint fk_ads_profile
    foreign key (anonimax_id)
    references public.profiles(anonimax_id)
    on update cascade
    on delete set null
);

alter table public.profiles enable row level security;
alter table public.ads enable row level security;

-- Public read access.
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

drop policy if exists "ads_select_public" on public.ads;
create policy "ads_select_public"
  on public.ads for select
  using (true);

-- Public insert access with basic guards (tighten as needed).
drop policy if exists "profiles_insert_public" on public.profiles;
create policy "profiles_insert_public"
  on public.profiles for insert
  with check (
    length(trim(nick)) > 0
    and length(trim(session_id)) >= 20
    and anonimax_id like 'ANX-%'
  );

drop policy if exists "ads_insert_public" on public.ads;
create policy "ads_insert_public"
  on public.ads for insert
  with check (
    length(trim(title)) > 0
    and length(trim(category)) > 0
    and length(trim(description)) > 0
    and length(trim(contact_session)) > 0
    and price >= 0
  );

-- Block update/delete from anon key by default.
drop policy if exists "profiles_no_update" on public.profiles;
create policy "profiles_no_update"
  on public.profiles for update
  using (false);

drop policy if exists "profiles_no_delete" on public.profiles;
create policy "profiles_no_delete"
  on public.profiles for delete
  using (false);

drop policy if exists "ads_no_update" on public.ads;
create policy "ads_no_update"
  on public.ads for update
  using (false);

drop policy if exists "ads_no_delete" on public.ads;
create policy "ads_no_delete"
  on public.ads for delete
  using (false);
