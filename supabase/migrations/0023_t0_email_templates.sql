-- T+0 autopilot: seed missing prospect_confirm / sales_brief for existing orgs.
-- Default parcours send_email nodes look these up by kind; without them
-- Confirmation T+0 fails and sendQuoteEmails does not run.
-- Insert-if-missing only — customized templates are left untouched.

insert into public.email_templates (organization_id, kind, subject, body)
select o.id, v.kind, v.subject, v.body
from public.organizations o
cross join (values
  (
    'prospect_confirm',
    'Votre demande — récapitulatif',
    E'Bonjour {{contact_name}},\n\nMerci pour votre demande. Vous trouverez ci-joint le récapitulatif de votre configuration.\nNotre équipe vous recontacte sous 24h ouvrées.\n\nSuivez votre demande : {{suivi_url}}\nCode PIN : {{pin}}\n\n{{sales_name}}'
  ),
  (
    'sales_brief',
    '[QuoteBuilder] Nouveau brief {{contact_company}} — {{score_label}}',
    E'Nouveau devis reçu.\n\nProspect : {{contact_name}} ({{contact_email}})\nSociété : {{contact_company}}\nScore : {{score}} / 100 ({{score_label}})\n\nParamètres :\n{{answers_text}}\n\nConfiguration : {{suggestion_name}}\nFourchette : {{price_range}}'
  )
) as v(kind, subject, body)
where not exists (
  select 1
  from public.email_templates t
  where t.organization_id = o.id
    and t.kind = v.kind
);
