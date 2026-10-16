-- A unique, readable address for every post: /blog/<slug>, e.g.
-- "🚀 Building my site in public: the stack…" → building-my-site-in-public-the-stack-…
-- The slug is set once, when the post is created, and then stays the same even if the title
-- changes, so shared links keep working. Clearing it (empty) makes the database build a new one.
-- Run once in Supabase → SQL Editor before deploying the code that reads posts.slug.
-- Safe to run more than once.

alter table public.posts add column if not exists slug text;

-- Title → slug: lowercase, Turkish and other accents to plain letters, everything else
-- (spaces, emoji, punctuation) to single dashes, at most 80 characters.
create or replace function public.slugify(t text)
returns text
language sql
immutable
as $$
  select trim(both '-' from left(
    trim(both '-' from regexp_replace(
      translate(replace(lower(coalesce(t, '')), 'ß', 'ss'),
                'çğıöşüäëéèêâàîïôûùÿ', 'cgiosuaeeeeaaiiouuy'),
      '[^a-z0-9]+', '-', 'g')),
    80));
$$;

-- Adds -2, -3, … when another post already uses the slug.
create or replace function public.unique_post_slug(base text, post_id uuid)
returns text
language plpgsql
as $$
declare
  candidate text := coalesce(nullif(base, ''), 'post-' || left(post_id::text, 7));
  n int := 1;
begin
  while exists (select 1 from public.posts where slug = candidate and id <> post_id) loop
    n := n + 1;
    candidate := coalesce(nullif(base, ''), 'post-' || left(post_id::text, 7)) || '-' || n;
  end loop;
  return candidate;
end;
$$;

create or replace function public.set_post_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or btrim(new.slug) = '' then
    new.slug := public.unique_post_slug(public.slugify(new.title), new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists posts_set_slug on public.posts;
create trigger posts_set_slug
  before insert or update on public.posts
  for each row execute function public.set_post_slug();

-- Existing posts, oldest first so the first one keeps the plain slug.
do $$
declare
  p record;
begin
  for p in select id from public.posts where slug is null or btrim(slug) = '' order by created_at loop
    update public.posts set slug = '' where id = p.id;  -- the trigger fills it in
  end loop;
end;
$$;

alter table public.posts alter column slug set not null;
create unique index if not exists posts_slug_key on public.posts (slug);
