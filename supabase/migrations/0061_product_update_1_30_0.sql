-- In-app changelog: 1.30.0 (variantes WooCommerce dans le catalogue devis).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.30.0',
  'Variantes WooCommerce dans le catalogue devis',
  '[
    "À la synchro WooCommerce, un produit variable récupère toutes ses variations (y compris au-delà de 100), avec SKU, prix et attributs — sans effacer les variations déjà stockées si le fetch est incomplet.",
    "Dans le widget et le funnel catalogue, le visiteur choisit les options d’attributs ; la ligne de devis utilise la vraie variation Woo (id + SKU).",
    "Une combinaison que Woo ne vend pas est refusée : pas de faux SKU inventé.",
    "Les produits simples restent sans id de variation ; le markup s’applique toujours aux prix de variation."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
