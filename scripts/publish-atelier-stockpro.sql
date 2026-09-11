-- Publish the Chat IA demo shop « Atelier StockPro » so /b/demo/atelier-stockpro is public.
-- Org slug `demo` only. Idempotent. Safe to re-run.
--
-- Apply on project spgskgtycqxjziwjpjol (SQL editor) :
--   update public.shops as s
--   set status = 'published',
--       published_at = coalesce(s.published_at, now()),
--       updated_at = now()
--   from public.organizations as o
--   where s.organization_id = o.id
--     and o.slug = 'demo'
--     and s.id = 'f4f30846-4a8b-4223-a088-121d26d32d29'
--     and s.slug = 'atelier-stockpro'
--     and s.status = 'draft';
--
-- Dashboard equivalent : /integrations/shop/f4f30846-4a8b-4223-a088-121d26d32d29 → Publier.

UPDATE public.shops AS s
SET status = 'published',
    published_at = COALESCE(s.published_at, now()),
    updated_at = now()
FROM public.organizations AS o
WHERE s.organization_id = o.id
  AND o.slug = 'demo'
  AND s.id = 'f4f30846-4a8b-4223-a088-121d26d32d29'
  AND s.slug = 'atelier-stockpro'
  AND s.status = 'draft';
