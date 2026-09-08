create schema if not exists private;

create type public.subscription_status as enum (
  'pending', 'trialing', 'active', 'past_due', 'paused', 'canceled', 'suspended'
);
create type public.upload_status as enum (
  'pending', 'uploaded', 'processing', 'ready', 'failed'
);
create type public.approval_status as enum (
  'pending_review', 'changes_requested', 'approved'
);
create type public.schedule_channel as enum (
  'instagram_feed', 'instagram_reel', 'instagram_story', 'facebook_page'
);
create type public.schedule_status as enum (
  'scheduled', 'publishing', 'published', 'failed'
);
create type public.ad_campaign_status as enum (
  'draft', 'active', 'paused', 'failed'
);
create type public.webhook_provider as enum ('mercadopago', 'meta');
create type public.workspace_role as enum ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');
create type public.webhook_status as enum (
  'received', 'queued', 'processing', 'processed', 'retryable', 'dead_letter'
);
create type public.meta_connection_status as enum (
  'active', 'expiring', 'needs_reauth', 'revoked'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.plans (
  id text primary key,
  name text not null,
  version integer not null default 1 check (version > 0),
  price_cents integer not null check (price_cents >= 0),
  brand_limit integer not null check (brand_limit >= 0),
  creative_limit integer not null check (creative_limit >= 0),
  allows_ads boolean not null default false,
  allows_white_label boolean not null default false,
  mp_preapproval_plan_id text unique,
  active boolean not null default true,
  unique (name, version)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status public.subscription_status not null default 'pending',
  billing_mode text not null,
  mp_preference_id text unique,
  mp_preapproval_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  provider_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    current_period_end is null
    or current_period_start is null
    or current_period_end > current_period_start
  )
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  mp_payment_id text not null unique,
  status text not null,
  method text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL' check (length(currency) = 3),
  provider_updated_at timestamptz not null,
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.usage_periods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  creative_limit integer not null check (creative_limit >= 0),
  reserved_creatives integer not null default 0 check (reserved_creatives >= 0),
  used_creatives integer not null default 0 check (used_creatives >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, period_start),
  check (period_end > period_start),
  check (reserved_creatives + used_creatives <= creative_limit)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  niche text not null,
  value_proposition text not null,
  persona jsonb not null default '{}'::jsonb,
  target_audience text not null,
  tone_of_voice text not null,
  voice_examples text[] not null default '{}',
  forbidden_words text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meta_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null unique references public.brands(id) on delete cascade,
  status public.meta_connection_status not null default 'active',
  access_token_cipher bytea not null,
  access_token_iv bytea not null,
  access_token_tag bytea not null,
  key_version integer not null check (key_version > 0),
  page_id text not null,
  instagram_account_id text,
  ad_account_id text,
  scopes text[] not null default '{}',
  token_expires_at timestamptz,
  last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  uploaded_by_id uuid not null references public.profiles(id),
  storage_bucket text not null,
  storage_key text not null,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  checksum_sha256 text not null check (length(checksum_sha256) = 64),
  status public.upload_status not null default 'pending',
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_key)
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  media_upload_id uuid not null unique references public.media_uploads(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  prompt_version text not null,
  schema_version text not null,
  model text not null,
  brand_profile_hash text not null,
  visual_analysis jsonb not null,
  organic_copy jsonb not null,
  ads_copy_variations jsonb not null,
  compliance jsonb not null,
  approval_status public.approval_status not null default 'pending_review',
  approved_at timestamptz,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approval_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  status public.approval_status not null,
  feedback text,
  client_name text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  generation_id uuid not null references public.generations(id),
  channel public.schedule_channel not null,
  scheduled_at timestamptz not null,
  status public.schedule_status not null default 'scheduled',
  operation_key text not null unique,
  external_post_id text,
  external_container_id text,
  retry_count integer not null default 0 check (retry_count >= 0),
  last_error text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publication_attempts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  provider_code text,
  error_class text,
  sanitized_error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (schedule_id, attempt_number)
);

create table public.ad_campaign_configs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  generation_id uuid not null unique references public.generations(id),
  ad_account_id text not null,
  objective text not null,
  daily_budget_cents integer not null check (daily_budget_cents > 0),
  currency text not null default 'BRL' check (length(currency) = 3),
  operation_key text not null unique,
  status public.ad_campaign_status not null default 'draft',
  external_campaign_id text,
  external_ad_set_id text,
  external_creative_id text,
  external_ad_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider public.webhook_provider not null,
  external_event_id text not null,
  resource_id text not null,
  event_type text not null,
  status public.webhook_status not null default 'received',
  payload jsonb not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  provider_created_at timestamptz,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_type text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index workspace_members_user_id_idx
  on public.workspace_members (user_id);
create index subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index payment_transactions_subscription_created_idx
  on public.payment_transactions (subscription_id, created_at desc);
create index payment_transactions_workspace_idx
  on public.payment_transactions (workspace_id);
create index usage_periods_workspace_period_end_idx
  on public.usage_periods (workspace_id, period_end);
create index brands_workspace_idx on public.brands (workspace_id);
create index meta_connections_workspace_idx
  on public.meta_connections (workspace_id);
create index meta_connections_status_expiry_idx
  on public.meta_connections (status, token_expires_at);
create index media_uploads_workspace_created_idx
  on public.media_uploads (workspace_id, created_at desc);
create index media_uploads_brand_status_idx
  on public.media_uploads (brand_id, status);
create index generations_workspace_created_idx
  on public.generations (workspace_id, created_at desc);
create index approval_links_workspace_idx
  on public.approval_links (workspace_id);
create index approval_links_generation_expiry_idx
  on public.approval_links (generation_id, expires_at);
create index approval_decisions_workspace_idx
  on public.approval_decisions (workspace_id);
create index approval_decisions_generation_created_idx
  on public.approval_decisions (generation_id, created_at desc);
create index schedules_status_scheduled_idx
  on public.schedules (status, scheduled_at);
create index schedules_workspace_created_idx
  on public.schedules (workspace_id, created_at desc);
create index publication_attempts_workspace_idx
  on public.publication_attempts (workspace_id);
create index ad_campaign_configs_workspace_created_idx
  on public.ad_campaign_configs (workspace_id, created_at desc);
create index webhook_events_status_received_idx
  on public.webhook_events (status, received_at);
create index audit_logs_workspace_created_idx
  on public.audit_logs (workspace_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@invalid.local'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, 'Usuário'), '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger workspaces_set_updated_at before update on public.workspaces
  for each row execute function private.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function private.set_updated_at();
create trigger payment_transactions_set_updated_at before update on public.payment_transactions
  for each row execute function private.set_updated_at();
create trigger usage_periods_set_updated_at before update on public.usage_periods
  for each row execute function private.set_updated_at();
create trigger brands_set_updated_at before update on public.brands
  for each row execute function private.set_updated_at();
create trigger meta_connections_set_updated_at before update on public.meta_connections
  for each row execute function private.set_updated_at();
create trigger media_uploads_set_updated_at before update on public.media_uploads
  for each row execute function private.set_updated_at();
create trigger generations_set_updated_at before update on public.generations
  for each row execute function private.set_updated_at();
create trigger schedules_set_updated_at before update on public.schedules
  for each row execute function private.set_updated_at();
create trigger ad_campaign_configs_set_updated_at before update on public.ad_campaign_configs
  for each row execute function private.set_updated_at();
