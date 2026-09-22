-- In-app changelog: 1.22.0 (titres commerçant sur les funnels publics et embeds).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.22.0',
  'Titres commerçant sur les funnels publics et embeds',
  '[
    "Sur /c/… et /embed/…, l’onglet et le partage Open Graph affichent le devis du commerçant (ex. « Devis rayonnage — Quickly International »), plus le slogan marketing QuoteBuilder.",
    "Un nom de funnel déjà au nom du commerçant est conservé tel quel.",
    "Les embeds restent noindex, canoniques vers /c/…, et n’embarquent plus le JSON-LD produit QuoteBuilder.",
    "Le shortcode / widget.js titre l’iframe « Devis … » (ou data-title) et fixe une hauteur explicite (défaut 720px)."
  ]'::jsonb,
  '2026-09-22'
)
on conflict (version) do nothing;
