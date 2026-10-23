-- Study calendar for /cloud and /nextex-mcp: one row per planned study day and track,
-- seeded from PLAN.md. A day shows outlined while planned and filled once done is true.
-- Run once in Supabase → SQL Editor before deploying the code that reads it. Safe to re-run.

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  track text not null check (track in ('cloud', 'mcp')),
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (day, track)
);

alter table public.study_sessions enable row level security;

drop policy if exists "study sessions are public" on public.study_sessions;
create policy "study sessions are public" on public.study_sessions for select using (true);

drop policy if exists "admins write study sessions" on public.study_sessions;
create policy "admins write study sessions" on public.study_sessions
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed from PLAN.md: every day this week, then the weekly cloud notes (Fridays)
-- and the MCP build steps of weeks 4 and 5. Re-running keeps titles in sync and leaves done alone.
insert into public.study_sessions (day, track, title) values
  ('2026-10-19', 'cloud', 'AWS account: free tier, billing alarm, IAM user with MFA'),
  ('2026-10-20', 'cloud', 'Domain 1: IAM users, roles, policies, least privilege'),
  ('2026-10-21', 'cloud', 'Domain 1: VPC basics, security groups vs NACLs'),
  ('2026-10-22', 'cloud', 'Domain 1: KMS and Secrets Manager'),
  ('2026-10-23', 'cloud', 'Cloud note 1: securing a small API on AWS'),
  ('2026-10-24', 'cloud', 'Domain 1 practice questions'),
  ('2026-10-30', 'cloud', 'Cloud note 2: S3 security (Domain 1)'),
  ('2026-11-06', 'cloud', 'Cloud note 3: Multi-AZ, RDS backups, fallbacks (Domain 2)'),
  ('2026-11-13', 'cloud', 'Cloud note 4: SQS, decoupling, retries (Domain 2)'),
  ('2026-11-20', 'cloud', 'Cloud note 5: caching, CloudFront, latency (Domain 3)'),
  ('2026-11-27', 'cloud', 'Cloud note 6: Lambda vs ECS vs EC2 for an AI backend (Domain 3)'),
  ('2026-12-04', 'cloud', 'Cloud note 7: pricing models and token spend (Domain 4)'),
  ('2026-12-11', 'cloud', 'Cloud note 8: cost review of everything built (Domain 4)'),

  ('2026-10-19', 'mcp', 'MCP intro and architecture: host, client, server; tools, resources, prompts'),
  ('2026-10-20', 'mcp', 'Python SDK quickstart: a server with one tool'),
  ('2026-10-21', 'mcp', 'Connect to Claude; test with the MCP Inspector'),
  ('2026-10-22', 'mcp', 'Add a resource and a second tool; errors and input validation'),
  ('2026-10-23', 'mcp', 'Compare with the NexTex MCP server'),
  ('2026-10-24', 'mcp', 'Write up how MCP works, in my own words'),
  ('2026-11-13', 'mcp', 'Expose "Ask my blog" as an MCP tool'),
  ('2026-11-20', 'mcp', 'Agent loop from scratch using the MCP tools')
on conflict (day, track) do update set title = excluded.title;
