-- Seed Quickly International — configurateur rayonnage

with org as (
  insert into public.organizations (
    name, slug, plan, branding, sales_email, sales_name, sales_phone
  )
  values (
    'Quickly International',
    'quickly',
    'pro',
    '{"accent":"#d97706","logoText":"Quickly"}'::jsonb,
    'commercial@quickly-international.com',
    'Équipe commerciale Quickly',
    '+33 3 00 00 00 00'
  )
  returning id
),
cfg as (
  insert into public.configurators (
    organization_id, name, slug, sector, wizard_enabled, chat_enabled, theme
  )
  select
    org.id,
    'Rayonnage industriel',
    'rayonnage',
    'rayonnage',
    true,
    true,
    '{"accent":"#d97706","background":"#0f172a"}'::jsonb
  from org
  returning id, organization_id
),
steps as (
  insert into public.wizard_steps (
    organization_id, configurator_id, sort_order, title, subtitle, screen_type
  )
  select
    cfg.organization_id,
    cfg.id,
    v.sort_order,
    v.title,
    v.subtitle,
    v.screen_type
  from cfg
  cross join (
    values
      (0, 'Type de projet', 'Quel espace souhaitez-vous équiper ?', 'questions'),
      (1, 'Dimensionnement', 'Surface, hauteur et contraintes du site', 'questions'),
      (2, 'Capacité', 'Charges et fréquence d''accès', 'questions'),
      (3, 'Configurations recommandées', '2 à 3 solutions adaptées à votre brief', 'suggestions'),
      (4, 'Personnalisation', 'Quantités, couleurs, options et plan', 'customize'),
      (5, 'Vos coordonnées', 'Recevez votre récapitulatif', 'contact')
  ) as v(sort_order, title, subtitle, screen_type)
  returning id, organization_id, sort_order
),
q1 as (
  insert into public.wizard_questions (
    organization_id, step_id, key, label, help_text, type, required, sort_order, options
  )
  select
    s.organization_id,
    s.id,
    'project_type',
    'Type d''espace',
    'Choisissez le contexte le plus proche de votre projet',
    'visual_choice',
    true,
    0,
    '{
      "choices": [
        {"value":"entrepot","label":"Entrepôt","description":"Stockage palettes, allées, hauteur utile"},
        {"value":"commerce","label":"Commerce","description":"Réserve magasin, picking fréquent"},
        {"value":"cuisine_pro","label":"Cuisine pro","description":"Normes alimentaires, inox, humidité"},
        {"value":"garage","label":"Garage / atelier","description":"Pièces, outillage, charges ponctuelles"}
      ]
    }'::jsonb
  from steps s
  where s.sort_order = 0
),
q2 as (
  insert into public.wizard_questions (
    organization_id, step_id, key, label, help_text, type, required, sort_order, options
  )
  select * from (
    select
      s.organization_id,
      s.id,
      v.key,
      v.label,
      v.help_text,
      v.type,
      v.required,
      v.sort_order,
      v.options
    from steps s
    cross join (
      values
        (
          'surface',
          'Surface au sol (m²)',
          'Surface approximative à équiper',
          'number',
          true,
          0,
          '{"min":10,"max":20000,"step":10,"unit":"m²","placeholder":"600"}'::jsonb
        ),
        (
          'height',
          'Hauteur disponible (m)',
          'Hauteur sous plafond ou sous poutre',
          'number',
          true,
          1,
          '{"min":2,"max":16,"step":0.5,"unit":"m","placeholder":"8"}'::jsonb
        ),
        (
          'constraints',
          'Contraintes spécifiques',
          'Plusieurs choix possibles',
          'multi_select',
          false,
          2,
          '{
            "choices": [
              {"value":"alimentaire","label":"Normes alimentaires"},
              {"value":"humidite","label":"Humidité / froid"},
              {"value":"exterieur","label":"Extérieur / semi-ouvert"},
              {"value":"seisme","label":"Zone sismique"},
              {"value":"aucune","label":"Aucune contrainte particulière"}
            ]
          }'::jsonb
        )
    ) as v(key, label, help_text, type, required, sort_order, options)
    where s.sort_order = 1
  ) q
),
q3 as (
  insert into public.wizard_questions (
    organization_id, step_id, key, label, help_text, type, required, sort_order, options
  )
  select * from (
    select
      s.organization_id,
      s.id,
      v.key,
      v.label,
      v.help_text,
      v.type,
      true,
      v.sort_order,
      v.options
    from steps s
    cross join (
      values
        (
          'load',
          'Poids estimé par niveau (kg)',
          'Charge max par niveau de stockage',
          'number',
          0,
          '{"min":50,"max":4000,"step":50,"unit":"kg","placeholder":"800"}'::jsonb
        ),
        (
          'access',
          'Fréquence d''accès',
          'À quelle fréquence les emplacements sont-ils sollicités ?',
          'select',
          1,
          '{
            "choices": [
              {"value":"faible","label":"Faible — stockage long terme"},
              {"value":"moyenne","label":"Moyenne — quelques rotations / semaine"},
              {"value":"haute","label":"Haute — picking quotidien"}
            ]
          }'::jsonb
        )
    ) as v(key, label, help_text, type, sort_order, options)
    where s.sort_order = 2
  ) q
),
prods as (
  insert into public.products (
    organization_id, configurator_id, name, description, price_min, price_max, tags, options
  )
  select
    cfg.organization_id,
    cfg.id,
    v.name,
    v.description,
    v.price_min,
    v.price_max,
    v.tags,
    v.options
  from cfg
  cross join (
    values
      (
        'Rayonnage palettes lourd',
        'Échelles et lisses pour palettes jusqu''à 1000 kg / niveau. Idéal entrepôt.',
        4500,
        18000,
        array['entrepot','lourd','palettes'],
        '[{"key":"color","label":"Couleur","values":[{"value":"ral5010","label":"Bleu RAL 5010"},{"value":"ral3000","label":"Rouge RAL 3000"},{"value":"galva","label":"Galvanisé"}]},{"key":"levels","label":"Niveaux","values":[{"value":"3","label":"3 niveaux"},{"value":"4","label":"4 niveaux"},{"value":"5","label":"5 niveaux"}]}]'::jsonb
      ),
      (
        'Rayonnage mi-lourd',
        'Polyvalent pour cartons, bacs et palettes légères. Commerce et atelier.',
        1800,
        7500,
        array['commerce','garage','moyen'],
        '[{"key":"color","label":"Couleur","values":[{"value":"ral5010","label":"Bleu RAL 5010"},{"value":"ral7035","label":"Gris RAL 7035"},{"value":"galva","label":"Galvanisé"}]}]'::jsonb
      ),
      (
        'Rayonnage picking / léger',
        'Accès fréquent, petites pièces, réserve magasin.',
        900,
        4200,
        array['commerce','picking','leger'],
        '[{"key":"color","label":"Couleur","values":[{"value":"ral5010","label":"Bleu RAL 5010"},{"value":"ral7035","label":"Gris RAL 7035"}]}]'::jsonb
      ),
      (
        'Rayonnage alimentaire inox',
        'Inox et finitions lessivables pour cuisines et chambres froides.',
        3200,
        14000,
        array['cuisine_pro','alimentaire','humidite'],
        '[{"key":"finish","label":"Finition","values":[{"value":"inox304","label":"Inox 304"},{"value":"epoxy_blanc","label":"Époxy blanc alimentaire"}]}]'::jsonb
      ),
      (
        'Cantilever',
        'Bras en porte-à-faux pour charges longues (tubes, bois, profilés).',
        2800,
        12000,
        array['garage','atelier','long'],
        '[{"key":"color","label":"Couleur","values":[{"value":"ral3000","label":"Rouge RAL 3000"},{"value":"galva","label":"Galvanisé"}]}]'::jsonb
      )
  ) as v(name, description, price_min, price_max, tags, options)
  returning id, organization_id, configurator_id, name, tags
)
insert into public.email_templates (organization_id, kind, subject, body)
select
  org.id,
  v.kind,
  v.subject,
  v.body
from org
cross join (
  values
    (
      'prospect_confirm',
      'Votre configuration Quickly — récapitulatif',
      'Bonjour {{contact_name}},\n\nMerci pour votre demande. Vous trouverez ci-joint le récapitulatif de votre configuration.\nNotre équipe vous recontacte sous 24h ouvrées.\n\n{{sales_name}} — Quickly International'
    ),
    (
      'sales_brief',
      '[QuoteBuilder] Nouveau brief {{contact_company}} — {{score_label}}',
      'Nouveau devis reçu.\n\nProspect : {{contact_name}} ({{contact_email}})\nSociété : {{contact_company}}\nScore : {{score}} / 100 ({{score_label}})\n\nParamètres :\n{{answers_text}}\n\nConfiguration : {{suggestion_name}}\nFourchette : {{price_range}}'
    )
) as v(kind, subject, body);

insert into public.pdf_templates (organization_id, title, intro, footer)
select
  id,
  'Récapitulatif de votre configuration',
  'Voici la synthèse de votre projet de rayonnage. Les prix indiqués sont des fourchettes indicatives, hors pose et hors options spécifiques.',
  'Quickly International — Devis indicatif, non contractuel.'
from public.organizations
where slug = 'quickly';

-- Suggestion rules after products exist
insert into public.suggestion_rules (
  organization_id, configurator_id, name, priority, conditions, product_ids,
  price_min, price_max, headline, description
)
select
  p.organization_id,
  p.configurator_id,
  'Entrepôt palettes',
  100,
  '{"all":[{"key":"project_type","op":"eq","value":"entrepot"}]}'::jsonb,
  array_agg(p.id) filter (where p.name in ('Rayonnage palettes lourd', 'Rayonnage mi-lourd')),
  4500,
  18000,
  'Solution entrepôt palettisé',
  'Configuration lourde pour palettes, avec variante mi-lourde si les charges sont plus faibles.'
from public.products p
join public.configurators c on c.id = p.configurator_id
join public.organizations o on o.id = c.organization_id
where o.slug = 'quickly'
group by p.organization_id, p.configurator_id;

insert into public.suggestion_rules (
  organization_id, configurator_id, name, priority, conditions, product_ids,
  price_min, price_max, headline, description
)
select
  p.organization_id,
  p.configurator_id,
  'Commerce / réserve',
  90,
  '{"all":[{"key":"project_type","op":"eq","value":"commerce"}]}'::jsonb,
  array_agg(p.id) filter (where p.name in ('Rayonnage picking / léger', 'Rayonnage mi-lourd')),
  900,
  7500,
  'Réserve magasin & picking',
  'Priorité à l''accès fréquent, avec un mi-lourd pour les zones de réserve.'
from public.products p
join public.configurators c on c.id = p.configurator_id
join public.organizations o on o.id = c.organization_id
where o.slug = 'quickly'
group by p.organization_id, p.configurator_id;

insert into public.suggestion_rules (
  organization_id, configurator_id, name, priority, conditions, product_ids,
  price_min, price_max, headline, description
)
select
  p.organization_id,
  p.configurator_id,
  'Cuisine professionnelle',
  90,
  '{"all":[{"key":"project_type","op":"eq","value":"cuisine_pro"}]}'::jsonb,
  array_agg(p.id) filter (where p.name in ('Rayonnage alimentaire inox', 'Rayonnage picking / léger')),
  3200,
  14000,
  'Hygiène & normes alimentaires',
  'Inox lessivable, adapté chambres froides et zones humides.'
from public.products p
join public.configurators c on c.id = p.configurator_id
join public.organizations o on o.id = c.organization_id
where o.slug = 'quickly'
group by p.organization_id, p.configurator_id;

insert into public.suggestion_rules (
  organization_id, configurator_id, name, priority, conditions, product_ids,
  price_min, price_max, headline, description
)
select
  p.organization_id,
  p.configurator_id,
  'Garage / atelier',
  80,
  '{"all":[{"key":"project_type","op":"eq","value":"garage"}]}'::jsonb,
  array_agg(p.id) filter (where p.name in ('Rayonnage mi-lourd', 'Cantilever')),
  1800,
  12000,
  'Atelier polyvalent',
  'Mi-lourd pour bacs et pièces, cantilever pour charges longues.'
from public.products p
join public.configurators c on c.id = p.configurator_id
join public.organizations o on o.id = c.organization_id
where o.slug = 'quickly'
group by p.organization_id, p.configurator_id;

-- Fallback if no rule matches
insert into public.suggestion_rules (
  organization_id, configurator_id, name, priority, conditions, product_ids,
  price_min, price_max, headline, description
)
select
  p.organization_id,
  p.configurator_id,
  'Solution mixte',
  10,
  '{"all":[]}'::jsonb,
  array_agg(p.id),
  900,
  18000,
  'Configuration sur mesure',
  'Mix de gammes pour cadrer le besoin en attendant le passage commercial.'
from public.products p
join public.configurators c on c.id = p.configurator_id
join public.organizations o on o.id = c.organization_id
where o.slug = 'quickly'
group by p.organization_id, p.configurator_id;
