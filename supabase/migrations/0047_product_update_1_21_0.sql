-- In-app changelog: 1.21.0 (URL WooCommerce sans doublon catalogue).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.21.0',
  'URL WooCommerce sans doubler le catalogue',
  '[
    "Sur Boutiques → fiche connexion WooCommerce, un champ URL permet de pointer une autre adresse (changement de domaine ou clone) sans créer une deuxième connexion.",
    "Les clés REST déjà enregistrées sont testées avant le changement ; si elles ne répondent pas, l’URL actuelle reste en place avec un message clair.",
    "Quand une organisation n’a qu’une connexion Woo, reconnecter le plugin WordPress depuis une autre URL met à jour cette connexion au lieu d’importer un second catalogue.",
    "Une synchronisation restée « en cours » plus de 6 minutes est marquée interrompue, pour pouvoir relancer sans blocage."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
