-- Fiche B2B : mode d'emploi, conformité, garantie. Distinct de la description et de la galerie.

alter table public.products
  add column if not exists sheet jsonb not null default '{}'::jsonb;

comment on column public.products.sheet is
  'Mode d''emploi (manualText) et documents {role, src, label} : manual, certificate, warranty.';
