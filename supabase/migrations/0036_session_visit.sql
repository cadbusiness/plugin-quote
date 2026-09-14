-- Visit metadata on abandoned sessions (geo, device, duration via created_at).

alter table public.quote_sessions
  add column if not exists country text,
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists user_agent text,
  add column if not exists device text;

create index if not exists analytics_events_session_idx
  on public.analytics_events (organization_id, session_id, created_at desc);
