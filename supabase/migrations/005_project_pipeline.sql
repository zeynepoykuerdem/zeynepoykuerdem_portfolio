-- Architecture diagram per project: an ordered list of pipeline steps, each with a name and
-- an optional detail line, e.g. [{"name": "Edge device", "detail": "inference"}, ...].
-- The home page draws a diagram for every project whose pipeline is not empty.
-- Run once in Supabase → SQL Editor before deploying the home page that reads it.
-- Safe to run more than once: NexTex AI is only filled while its pipeline is still empty.

alter table public.projects add column if not exists pipeline jsonb not null default '[]'::jsonb;

alter table public.projects drop constraint if exists projects_pipeline_is_array;
alter table public.projects add constraint projects_pipeline_is_array
  check (jsonb_typeof(pipeline) = 'array');

update public.projects set pipeline = '[
  {"name": "Camera"},
  {"name": "Edge device", "detail": "inference"},
  {"name": "Message broker", "detail": "queued events"},
  {"name": "Backend + UI"}
]'::jsonb
where name = 'NexTex AI' and pipeline = '[]'::jsonb;
