-- Newsletter settings for the blog: the sign-up link (from a service like Buttondown or
-- Substack), the text shown on the blog, and how often it goes out. One row, like now_page.
-- The blog only shows the newsletter box while the link is a valid https:// address.
-- Run once in Supabase → SQL Editor before deploying the code that reads it. Safe to re-run.

create table if not exists public.newsletter (
  id int primary key default 1 check (id = 1),
  url text not null default '' check (url = '' or url ~ '^https://\S+$'),
  text text not null default '',
  frequency text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.newsletter enable row level security;

drop policy if exists "newsletter is public" on public.newsletter;
create policy "newsletter is public" on public.newsletter for select using (true);

drop policy if exists "admins write newsletter" on public.newsletter;
create policy "admins write newsletter" on public.newsletter
  for all using (public.is_admin()) with check (public.is_admin());
