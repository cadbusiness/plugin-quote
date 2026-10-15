-- In-app changelog: 1.32.0 (email commercial et nom d'expéditeur).

insert into public.product_updates (version, title, items, released_at)
values (
  '1.32.0',
  'Email commercial et nom d''expéditeur',
  '[
    "Dans Paramètres, owner et admin renseignent l''email commercial et le nom d''expéditeur (signature des emails).",
    "À l''inscription, ces champs sont proposés : l''email est prérempli avec le vôtre ; un nom vide devient le nom de l''organisation.",
    "Les briefs commerciaux et les réponses des prospects utilisent cette boîte au lieu de celle de la plateforme.",
    "Si rien n''est renseigné, le brief et le reply-to tombent sur l''email du propriétaire, et la signature sur le nom de l''organisation.",
    "Seuls owner et admin peuvent modifier les templates email."
  ]'::jsonb,
  '2026-10-15'
)
on conflict (version) do nothing;
