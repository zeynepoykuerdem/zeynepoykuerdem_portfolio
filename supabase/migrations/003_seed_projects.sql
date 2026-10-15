-- Move the home page projects, which were hard-coded in app/page.tsx, into public.projects.
-- Run once in Supabase → SQL Editor before deploying the code that reads them.
-- Safe to run more than once: a project is skipped if one with the same name exists.

insert into public.projects (name, summary, stack, github_url, sort_order)
select v.name, v.summary, v.stack, v.github_url, v.sort_order
from (values
  ('NexTex AI',
   'Camera-based defect detection for circular knitting machines. Edge devices run inference and send results to a cloud backend.',
   array['FastAPI', 'RabbitMQ', 'MinIO', 'Raspberry Pi 5'],
   null::text,
   1),
  ('Studiee AI',
   'An AI-powered student performance platform, built independently from idea to working product.',
   array['Next.js', 'Supabase', 'Vercel'],
   'https://github.com/zeynepoykuerdem/dershane_ai',
   2),
  ('Explainable AI thesis',
   'Grad-CAM vs. Integrated Gradients, and how model memorization affects explanations.',
   array['PyTorch', 'Grad-CAM'],
   'https://github.com/zeynepoykuerdem/master_thesis',
   3)
) as v(name, summary, stack, github_url, sort_order)
where not exists (select 1 from public.projects p where p.name = v.name);
