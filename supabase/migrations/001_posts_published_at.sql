-- For a database created from an earlier schema.sql. Run once in Supabase → SQL Editor
-- before deploying the code that reads posts.published_at. Safe to run more than once.

alter table public.posts add column if not exists published_at timestamptz;

-- Posts that are already live: the best known publish time is when they were created.
update public.posts set published_at = created_at where published and published_at is null;

create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published and (tg_op = 'INSERT' or not old.published) then
    new.published_at := now();
  elsif not new.published then
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_set_published_at on public.posts;
create trigger posts_set_published_at
  before insert or update of published on public.posts
  for each row execute function public.set_published_at();
