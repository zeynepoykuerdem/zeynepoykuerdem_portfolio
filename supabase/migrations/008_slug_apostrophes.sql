-- Apostrophes no longer split words in slugs: "AI Act's" → "ai-acts", not "ai-act-s".
-- Also rebuilds the slugs of posts created before this fix. Run once, before any post page
-- link has been shared; after that, existing slugs should not change.
-- Safe to run more than once.

create or replace function public.slugify(t text)
returns text
language sql
immutable
as $$
  select trim(both '-' from left(
    trim(both '-' from regexp_replace(
      translate(replace(regexp_replace(lower(coalesce(t, '')), '[''’]', '', 'g'), 'ß', 'ss'),
                'çğıöşüäëéèêâàîïôûùÿ', 'cgiosuaeeeeaaiiouuy'),
      '[^a-z0-9]+', '-', 'g')),
    80));
$$;

-- Rebuild only the slugs that the old rule got wrong: they match neither the new slug
-- nor the new slug with a -2, -3, … suffix.
do $$
declare
  p record;
begin
  for p in
    select id from public.posts
    where slug <> public.slugify(title)
      and slug not like public.slugify(title) || '-%'
    order by created_at
  loop
    update public.posts set slug = '' where id = p.id;  -- the trigger builds the new slug
  end loop;
end;
$$;
