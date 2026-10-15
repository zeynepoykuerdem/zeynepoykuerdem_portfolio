-- Fields for the prototype's pinned project cards: a label ("Computer vision"), an icon,
-- and a highlighted note ("Status: field pilot…"). Fills them in for the three seeded projects.
-- Run once in Supabase → SQL Editor before deploying the home page that reads them.
-- Safe to run more than once: rows are only filled while their label is still empty.

alter table public.projects add column if not exists label text not null default '';
alter table public.projects add column if not exists icon text not null default '';
alter table public.projects add column if not exists note_label text not null default '';
alter table public.projects add column if not exists note text not null default '';

update public.projects set
  label = 'Computer vision',
  icon = 'camera',
  note_label = 'Status',
  note = 'Field pilot at a production site, Sep 2026. Provisioned remotely, no on-site fallback needed.',
  stack = case when 'Python' = any(stack) then stack else array['Python'] || stack end
where name = 'NexTex AI' and label = '';

update public.projects set
  label = 'SaaS',
  icon = 'book',
  note_label = 'Status',
  note = 'Case study in progress. Architecture and key decisions coming soon.'
where name = 'Studiee AI' and label = '';

update public.projects set
  label = 'Research',
  icon = 'chart',
  note_label = 'Question',
  note = 'When two explanation methods disagree, which one tells you the truth about the model?',
  stack = case when 'Python' = any(stack) then stack else array['Python'] || stack end
where name = 'Explainable AI thesis' and label = '';
