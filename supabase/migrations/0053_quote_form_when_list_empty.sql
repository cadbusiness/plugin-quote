-- La page demande de devis montre le formulaire même sans produit.
-- L'ancien défaut était false : on l'aligne sur true, y compris les connexions déjà enregistrées.

update public.catalog_connections
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{storefront,showFormWhenEmpty}',
  'true'::jsonb,
  true
)
where coalesce(settings #>> '{storefront,showFormWhenEmpty}', 'false') <> 'true';
