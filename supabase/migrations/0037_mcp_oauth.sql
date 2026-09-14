-- OAuth 2.1 for hosted MCP (ChatGPT custom connectors, Claude remote).
-- Tokens are hashed; PostgREST is locked down (service role only).

create table if not exists public.mcp_oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  client_name text not null default 'MCP',
  redirect_uris text[] not null,
  token_endpoint_auth_method text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists public.mcp_oauth_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  client_id text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  redirect_uri text not null,
  code_challenge text not null,
  resource text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_oauth_codes_expires_idx
  on public.mcp_oauth_codes (expires_at)
  where used_at is null;

create table if not exists public.mcp_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  access_hash text not null unique,
  refresh_hash text not null unique,
  client_id text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  scopes text[] not null default array['mcp']::text[],
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_oauth_tokens_access_idx
  on public.mcp_oauth_tokens (access_hash)
  where revoked_at is null;

create index if not exists mcp_oauth_tokens_refresh_idx
  on public.mcp_oauth_tokens (refresh_hash)
  where revoked_at is null;

alter table public.mcp_oauth_clients enable row level security;
alter table public.mcp_oauth_codes enable row level security;
alter table public.mcp_oauth_tokens enable row level security;

revoke all on public.mcp_oauth_clients from anon, authenticated;
revoke all on public.mcp_oauth_codes from anon, authenticated;
revoke all on public.mcp_oauth_tokens from anon, authenticated;
