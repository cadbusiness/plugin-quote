-- Durable PIN lockout for /suivi (the in-memory limiter does not survive serverless instances).

alter table public.prospect_access
  add column if not exists pin_failed_attempts int not null default 0,
  add column if not exists pin_locked_until timestamptz;
