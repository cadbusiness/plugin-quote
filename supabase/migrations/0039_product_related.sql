-- Upsells / cross-sells Woo (IDs boutique) pour le moteur d'affinité.

alter table public.products
  add column if not exists related jsonb not null default '{}'::jsonb;
