-- One-time / idempotent alignment of advertised demo public URLs.
-- Org slug `demo` only. Safe to re-run. Does not touch `quickly` or other tenants.
--
-- Apply on project spgskgtycqxjziwjpjol (SQL editor or `supabase db query`):
--   psql "$DATABASE_URL" -f scripts/fix-demo-public-slugs.sql
--
-- After this, prefer `npm run seed:demo` (service role + DEMO_PASSWORD) so the
-- org name, chat, catalogue QB-DEMO-* and boutique content match the skill.
-- This script only remaps slugs when the canonical one is missing.

-- Funnel /c/demo/rayonnage : reuse principal or funnel-rayonnage, never catalogue-*.
UPDATE public.configurators AS c
SET slug = 'rayonnage',
    is_active = true
FROM public.organizations AS o
WHERE c.organization_id = o.id
  AND o.slug = 'demo'
  AND c.id = (
    SELECT c2.id
    FROM public.configurators AS c2
    WHERE c2.organization_id = o.id
      AND c2.slug IN ('principal', 'funnel-rayonnage')
      AND NOT EXISTS (
        SELECT 1
        FROM public.configurators AS taken
        WHERE taken.organization_id = o.id
          AND taken.slug = 'rayonnage'
      )
    ORDER BY CASE c2.slug WHEN 'principal' THEN 0 ELSE 1 END
    LIMIT 1
  );

-- Boutique /b/demo/vitrine : reuse espace-demo or vitrine-rayonnage.
UPDATE public.shops AS s
SET slug = 'vitrine',
    status = 'published',
    published_at = COALESCE(s.published_at, now())
FROM public.organizations AS o
WHERE s.organization_id = o.id
  AND o.slug = 'demo'
  AND s.id = (
    SELECT s2.id
    FROM public.shops AS s2
    WHERE s2.organization_id = o.id
      AND s2.slug IN ('espace-demo', 'vitrine-rayonnage')
      AND NOT EXISTS (
        SELECT 1
        FROM public.shops AS taken
        WHERE taken.organization_id = o.id
          AND taken.slug = 'vitrine'
      )
    ORDER BY CASE s2.slug WHEN 'espace-demo' THEN 0 ELSE 1 END
    LIMIT 1
  );
