-- Run this once in Supabase → SQL Editor (new query), after the project is created.
-- Visitors can read published content. Only admins (listed in public.admins) can write.

-- ---------- Admins ----------
-- Visitors never read this table. Admins are added after their first sign-in (see README).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Content tables ----------
create table if not exists public.profile (
  id int primary key default 1 check (id = 1),
  headline text,
  bio text,
  status text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cloud_notes (
  id uuid primary key default gen_random_uuid(),
  domain text not null default '',
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.mcp_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  status text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.now_page (
  id int primary key default 1 check (id = 1),
  body text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  summary text not null default '',
  stack text[] not null default '{}',
  github_url text,
  sort_order int not null default 0
);

-- ---------- Row-level security ----------
alter table public.profile enable row level security;
alter table public.posts enable row level security;
alter table public.cloud_notes enable row level security;
alter table public.mcp_notes enable row level security;
alter table public.now_page enable row level security;
alter table public.projects enable row level security;

-- Public read
create policy "profile is public" on public.profile for select using (true);
create policy "published posts are public" on public.posts for select using (published or public.is_admin());
create policy "cloud notes are public" on public.cloud_notes for select using (true);
create policy "mcp notes are public" on public.mcp_notes for select using (true);
create policy "now page is public" on public.now_page for select using (true);
create policy "projects are public" on public.projects for select using (true);

-- Admin write (insert, update, delete)
create policy "admins write profile" on public.profile for all using (public.is_admin()) with check (public.is_admin());
create policy "admins write posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());
create policy "admins write cloud notes" on public.cloud_notes for all using (public.is_admin()) with check (public.is_admin());
create policy "admins write mcp notes" on public.mcp_notes for all using (public.is_admin()) with check (public.is_admin());
create policy "admins write now page" on public.now_page for all using (public.is_admin()) with check (public.is_admin());
create policy "admins write projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Images ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media is public" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
