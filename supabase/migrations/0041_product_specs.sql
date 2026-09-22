-- Specs techniques déjà présentes en prod (jsonb). Idempotent pour les bases locales.

alter table public.products
  add column if not exists specs jsonb not null default '{}'::jsonb;
