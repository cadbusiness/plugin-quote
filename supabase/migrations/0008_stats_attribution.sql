-- Attribution UTM + payload analytics pour le tunnel de conversion

alter table public.quote_sessions
  add column if not exists visitor_id text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer text,
  add column if not exists landing_path text;

alter table public.quotes
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer text;

alter table public.analytics_events
  add column if not exists visitor_id text,
  add column if not exists payload jsonb not null default '{}'::jsonb;

create index if not exists analytics_events_org_type_idx
  on public.analytics_events (organization_id, event_type, created_at desc);
create index if not exists analytics_events_visitor_idx
  on public.analytics_events (organization_id, visitor_id, created_at desc);
create index if not exists quote_sessions_utm_idx
  on public.quote_sessions (organization_id, utm_source);
create index if not exists quotes_utm_idx
  on public.quotes (organization_id, utm_source);
