-- In-app changelog: 1.26.0 (devis reçus depuis WordPress).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.26.0',
  'Devis reçus depuis WordPress',
  '[
    "Un visiteur qui envoie une demande depuis le site WordPress (plugin QuoteBuilder) crée un devis dans le dashboard, en statut Nouveau, origine Site Web.",
    "Les lignes se rattachent aux produits déjà synchronisés (y compris les variations WooCommerce) ; un produit inconnu garde le nom envoyé.",
    "L’équipe est prévenue comme pour un brief funnel (notification in-app + email brief) ; le prospect n’est pas relancé automatiquement.",
    "Un même envoi n’est pas créé deux fois.",
    "Dans le plugin, ajouter deux fois le même produit simple met à jour la quantité au lieu de dupliquer la ligne."
  ]'::jsonb,
  '2026-09-23'
)
on conflict (version) do nothing;
