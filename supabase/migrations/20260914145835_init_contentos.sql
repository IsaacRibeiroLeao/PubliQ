create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pg_cron" with schema pg_catalog;
create extension if not exists "pg_net" with schema extensions;

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;

do $settings$
begin
  execute format(
    'alter database %I set app.settings.functions_url = %L',
    current_database(),
    'http://kong:8000/functions/v1'
  );
exception
  when insufficient_privilege then
    raise notice 'app.settings.functions_url não pôde ser definido neste banco.';
end;
$settings$;

create table public.plan_catalog (
  tier text primary key check (tier in ('STARTER', 'PRO', 'AGENCY')),
  monthly_price_cents integer not null,
  currency text not null default 'BRL',
  daily_prompt_limit integer,
  max_generation_days integer not null,
  max_accounts_per_platform integer not null,
  auto_post boolean not null default false,
  analytics boolean not null default false,
  teleprompter boolean not null default false,
  pdf_reports boolean not null default false,
  priority_support boolean not null default false
);

insert into public.plan_catalog (
  tier, monthly_price_cents, daily_prompt_limit, max_generation_days,
  max_accounts_per_platform, auto_post, analytics, teleprompter, pdf_reports, priority_support
) values
  ('STARTER', 0, 3, 1, 0, false, false, false, false, false),
  ('PRO', 9700, null, 31, 1, true, true, true, false, false),
  ('AGENCY', 24700, null, 31, 5, true, true, true, true, true);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name varchar(255),
  email varchar(255) not null,
  profession varchar(100) not null default 'advogado',
  niche varchar(100),
  timezone text not null default 'America/Sao_Paulo',
  plan_tier text not null default 'STARTER' references public.plan_catalog (tier),
  subscription_status varchar(50) not null default 'ACTIVE'
    check (subscription_status in ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING')),
  billing_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_usage_limits (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  daily_prompt_limit integer not null default 3,
  prompts_used_today integer not null default 0,
  last_prompt_date date not null default ((timezone('America/Sao_Paulo', now()))::date),
  constraint user_usage_limits_used_non_negative check (prompts_used_today >= 0),
  constraint user_usage_limits_limit_positive check (daily_prompt_limit > 0)
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform varchar(50) not null check (platform in ('INSTAGRAM', 'TIKTOK')),
  account_id varchar(100) not null,
  account_name varchar(255),
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  constraint social_accounts_unique_account unique (user_id, platform, account_id)
);

create table private.social_account_secrets (
  account_id uuid primary key references public.social_accounts (id) on delete cascade,
  access_token text not null,
  refresh_token text,
  updated_at timestamptz not null default now()
);

create table public.content_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title varchar(255) not null,
  hook_text text not null,
  body_text text not null,
  cta_text text not null,
  instagram_caption text,
  tiktok_caption text,
  ethical_theme text,
  ethical_framing text,
  compliance_notes text,
  target_date date not null,
  compliance_passed boolean not null default true,
  status varchar(50) not null default 'IDEA'
    check (status in ('IDEA', 'READY_TO_RECORD', 'RECORDED')),
  created_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title varchar(255) not null default 'Nova conversa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role varchar(20) not null check (role in ('user', 'assistant')),
  content text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  script_id uuid references public.content_scripts (id) on delete set null,
  media_path text not null,
  media_url text not null,
  instagram_caption text,
  tiktok_caption text,
  scheduled_for timestamptz not null,
  status varchar(50) not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED')),
  ig_media_id varchar(100),
  tiktok_publish_id varchar(100),
  error_log text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_analytics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.scheduled_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform varchar(50) not null check (platform in ('INSTAGRAM', 'TIKTOK')),
  views_count integer not null default 0,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  watch_time_avg_sec double precision not null default 0.0,
  synced_at timestamptz not null default now(),
  constraint post_analytics_unique_platform unique (post_id, platform)
);

create table public.compliance_rules (
  id uuid primary key default gen_random_uuid(),
  profession varchar(100) not null,
  code varchar(50) not null,
  title text not null,
  instruction text not null,
  unique (profession, code)
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  provider varchar(20) not null check (provider in ('STRIPE', 'ASAAS')),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create table private.app_settings (
  key text primary key,
  value text not null
);

create index profiles_plan_tier_idx on public.profiles (plan_tier);
create index social_accounts_user_platform_idx on public.social_accounts (user_id, platform);
create index content_scripts_user_target_idx on public.content_scripts (user_id, target_date desc);
create index chat_threads_user_updated_idx on public.chat_threads (user_id, updated_at desc);
create index chat_messages_thread_created_idx on public.chat_messages (thread_id, created_at);
create index chat_messages_user_id_idx on public.chat_messages (user_id);
create index scheduled_posts_queue_idx on public.scheduled_posts (status, scheduled_for)
  where status in ('PENDING', 'PROCESSING');
create index scheduled_posts_user_scheduled_idx on public.scheduled_posts (user_id, scheduled_for desc);
create index post_analytics_user_platform_idx on public.post_analytics (user_id, platform, synced_at desc);
create index post_analytics_post_id_idx on public.post_analytics (post_id);
create index billing_events_user_id_idx on public.billing_events (user_id);

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

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger chat_threads_set_updated_at
  before update on public.chat_threads
  for each row execute function private.set_updated_at();

create trigger scheduled_posts_set_updated_at
  before update on public.scheduled_posts
  for each row execute function private.set_updated_at();

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
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Usuário')
  );

  insert into public.user_usage_limits (user_id, daily_prompt_limit, prompts_used_today)
  values (new.id, 3, 0);

  insert into public.chat_threads (user_id, title)
  values (new.id, 'Copiloto');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.local_today(tz text)
returns date
language sql
stable
set search_path = ''
as $$
  select (timezone(coalesce(nullif(tz, ''), 'America/Sao_Paulo'), now()))::date;
$$;

create or replace function private.plan_max_accounts(p_tier text)
returns integer
language sql
stable
set search_path = ''
as $$
  select max_accounts_per_platform
  from public.plan_catalog
  where tier = p_tier;
$$;

create or replace function private.enforce_social_account_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tier text;
  v_max integer;
  v_count integer;
begin
  select plan_tier into v_tier
  from public.profiles
  where id = new.user_id;

  v_max := coalesce(private.plan_max_accounts(v_tier), 0);

  if v_max <= 0 then
    raise exception 'Seu plano não inclui conexão de redes sociais. Faça upgrade para Pro.';
  end if;

  select count(*) into v_count
  from public.social_accounts
  where user_id = new.user_id
    and platform = new.platform
    and id is distinct from new.id;

  if v_count >= v_max then
    raise exception 'Limite de % conta(s) % atingido neste plano.', v_max, new.platform;
  end if;

  return new;
end;
$$;

create trigger social_accounts_quota
  before insert or update of platform, user_id on public.social_accounts
  for each row execute function private.enforce_social_account_quota();

create or replace function private.consume_prompt_credit_for(user_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tier text;
  v_tz text;
  v_used integer;
  v_limit integer;
  v_date date;
  v_today date;
begin
  if (select auth.uid()) is distinct from user_uuid
     and (select auth.role()) is distinct from 'service_role' then
    raise exception 'forbidden';
  end if;

  select plan_tier, timezone
  into v_tier, v_tz
  from public.profiles
  where id = user_uuid
  for update;

  if v_tier is null then
    return false;
  end if;

  if v_tier in ('PRO', 'AGENCY') then
    return true;
  end if;

  v_today := private.local_today(v_tz);

  select prompts_used_today, daily_prompt_limit, last_prompt_date
  into v_used, v_limit, v_date
  from public.user_usage_limits
  where user_id = user_uuid
  for update;

  if not found then
    insert into public.user_usage_limits (user_id, daily_prompt_limit, prompts_used_today, last_prompt_date)
    values (user_uuid, 3, 1, v_today);
    return true;
  end if;

  if v_date < v_today then
    update public.user_usage_limits
    set prompts_used_today = 1,
        last_prompt_date = v_today
    where user_id = user_uuid;
    return true;
  end if;

  if v_used >= v_limit then
    return false;
  end if;

  update public.user_usage_limits
  set prompts_used_today = prompts_used_today + 1
  where user_id = user_uuid;

  return true;
end;
$$;

create or replace function public.consume_prompt_credit()
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.consume_prompt_credit_for((select auth.uid()));
$$;

create or replace function private.get_prompt_usage_for(user_uuid uuid)
returns table (
  plan_tier text,
  unlimited boolean,
  prompts_used_today integer,
  daily_prompt_limit integer,
  remaining integer,
  local_today date
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tier text;
  v_tz text;
  v_today date;
begin
  if (select auth.uid()) is distinct from user_uuid
     and (select auth.role()) is distinct from 'service_role' then
    raise exception 'forbidden';
  end if;

  select p.plan_tier, p.timezone into v_tier, v_tz
  from public.profiles p
  where p.id = user_uuid;

  v_today := private.local_today(v_tz);

  update public.user_usage_limits u
  set prompts_used_today = 0,
      last_prompt_date = v_today
  where u.user_id = user_uuid
    and u.last_prompt_date < v_today;

  return query
  select
    v_tier,
    v_tier in ('PRO', 'AGENCY'),
    case when v_tier in ('PRO', 'AGENCY') then 0 else u.prompts_used_today end,
    case when v_tier in ('PRO', 'AGENCY') then null else u.daily_prompt_limit end,
    case
      when v_tier in ('PRO', 'AGENCY') then null
      else greatest(u.daily_prompt_limit - u.prompts_used_today, 0)
    end,
    v_today
  from public.user_usage_limits u
  where u.user_id = user_uuid;
end;
$$;

create or replace function public.get_prompt_usage()
returns table (
  plan_tier text,
  unlimited boolean,
  prompts_used_today integer,
  daily_prompt_limit integer,
  remaining integer,
  local_today date
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.get_prompt_usage_for((select auth.uid()));
$$;

create or replace function private.claim_due_posts(batch_size integer default 10)
returns setof public.scheduled_posts
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with due as (
    select sp.id
    from public.scheduled_posts sp
    where sp.status = 'PENDING'
      and sp.scheduled_for <= now()
    order by sp.scheduled_for
    limit batch_size
    for update skip locked
  )
  update public.scheduled_posts sp
  set status = 'PROCESSING'
  from due
  where sp.id = due.id
  returning sp.*;
end;
$$;

create or replace function private.invoke_edge_function(fn_name text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_url text;
  service_key text;
  request_id bigint;
begin
  select value into base_url from private.app_settings where key = 'functions_url';
  select value into service_key from private.app_settings where key = 'service_role_key';

  if base_url is null then
    base_url := nullif(current_setting('app.settings.functions_url', true), '');
  end if;

  if service_key is null then
    service_key := nullif(current_setting('app.settings.service_role_key', true), '');
  end if;

  if base_url is null or service_key is null then
    raise notice 'ContentOS: configure private.app_settings functions_url e service_role_key para disparar %', fn_name;
    return null;
  end if;

  select net.http_post(
    url := rtrim(base_url, '/') || '/' || fn_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object('source', 'pg_cron', 'function', fn_name)
  )
  into request_id;

  return request_id;
end;
$$;

select cron.schedule(
  'contentos-publish-due-posts',
  '* * * * *',
  $$select private.invoke_edge_function('publish-scheduled')$$
);

select cron.schedule(
  'contentos-sync-analytics',
  '15 * * * *',
  $$select private.invoke_edge_function('sync-analytics')$$
);

alter table public.plan_catalog enable row level security;
alter table public.profiles enable row level security;
alter table public.user_usage_limits enable row level security;
alter table public.social_accounts enable row level security;
alter table public.content_scripts enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.post_analytics enable row level security;
alter table public.compliance_rules enable row level security;
alter table public.billing_events enable row level security;
alter table private.social_account_secrets enable row level security;
alter table private.app_settings enable row level security;

alter table public.plan_catalog force row level security;
alter table public.profiles force row level security;
alter table public.user_usage_limits force row level security;
alter table public.social_accounts force row level security;
alter table public.content_scripts force row level security;
alter table public.chat_threads force row level security;
alter table public.chat_messages force row level security;
alter table public.scheduled_posts force row level security;
alter table public.post_analytics force row level security;
alter table public.compliance_rules force row level security;
alter table public.billing_events force row level security;

create policy plan_catalog_read
  on public.plan_catalog for select
  to authenticated, anon
  using (true);

create policy profiles_select
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and plan_tier = (select p.plan_tier from public.profiles p where p.id = (select auth.uid()))
    and subscription_status = (select p.subscription_status from public.profiles p where p.id = (select auth.uid()))
  );

create policy usage_select
  on public.user_usage_limits for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy social_accounts_select
  on public.social_accounts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy social_accounts_insert
  on public.social_accounts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy social_accounts_update
  on public.social_accounts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy social_accounts_delete
  on public.social_accounts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy content_scripts_all
  on public.content_scripts for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy chat_threads_all
  on public.chat_threads for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy chat_messages_all
  on public.chat_messages for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy scheduled_posts_select
  on public.scheduled_posts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy scheduled_posts_insert
  on public.scheduled_posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy scheduled_posts_update
  on public.scheduled_posts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy scheduled_posts_delete
  on public.scheduled_posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy post_analytics_select
  on public.post_analytics for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy compliance_rules_select
  on public.compliance_rules for select
  to authenticated
  using (true);

create policy billing_events_select
  on public.billing_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'media-raw',
    'media-raw',
    false,
    52428800,
    array['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'media-public',
    'media-public',
    true,
    52428800,
    array['video/mp4', 'video/quicktime', 'video/webm']
  )
on conflict (id) do nothing;

create policy media_raw_select
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media-raw'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy media_raw_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media-raw'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy media_raw_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media-raw'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'media-raw'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy media_raw_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media-raw'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy media_public_select
  on storage.objects for select
  to public
  using (bucket_id = 'media-public');

create policy media_public_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media-public'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy media_public_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media-public'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'media-public'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema private to authenticated, service_role;

grant select on table public.plan_catalog to anon, authenticated, service_role;
grant select, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
grant select on table public.user_usage_limits to authenticated;
grant all on table public.user_usage_limits to service_role;
grant select, insert, update, delete on table public.social_accounts to authenticated;
grant all on table public.social_accounts to service_role;
grant select, insert, update, delete on table public.content_scripts to authenticated;
grant all on table public.content_scripts to service_role;
grant select, insert, update, delete on table public.chat_threads to authenticated;
grant all on table public.chat_threads to service_role;
grant select, insert, update, delete on table public.chat_messages to authenticated;
grant all on table public.chat_messages to service_role;
grant select, insert, update, delete on table public.scheduled_posts to authenticated;
grant all on table public.scheduled_posts to service_role;
grant select on table public.post_analytics to authenticated;
grant all on table public.post_analytics to service_role;
grant select on table public.compliance_rules to authenticated, service_role;
grant select on table public.billing_events to authenticated;
grant all on table public.billing_events to service_role;

grant all on table private.social_account_secrets to service_role;
grant all on table private.app_settings to service_role;

revoke all on table private.social_account_secrets from authenticated, anon, public;
revoke all on table private.app_settings from authenticated, anon, public;

grant execute on function public.consume_prompt_credit() to authenticated;
grant execute on function public.get_prompt_usage() to authenticated;
grant execute on function private.consume_prompt_credit_for(uuid) to authenticated, service_role;
grant execute on function private.get_prompt_usage_for(uuid) to authenticated, service_role;
create or replace function public.claim_due_posts(batch_size integer default 10)
returns setof public.scheduled_posts
language sql
security invoker
set search_path = ''
as $$
  select * from private.claim_due_posts(batch_size);
$$;

grant execute on function public.claim_due_posts(integer) to service_role;
grant execute on function private.claim_due_posts(integer) to service_role;
grant execute on function private.invoke_edge_function(text) to service_role;
grant execute on function private.local_today(text) to authenticated, service_role;

revoke execute on function public.consume_prompt_credit() from anon, public;
revoke execute on function public.get_prompt_usage() from anon, public;
revoke execute on function private.consume_prompt_credit_for(uuid) from anon, public;
revoke execute on function private.handle_new_user() from public, anon, authenticated;
revoke execute on function public.claim_due_posts(integer) from public, anon, authenticated;
revoke execute on function private.claim_due_posts(integer) from public, anon, authenticated;

insert into public.compliance_rules (profession, code, title, instruction) values
  ('advogado', 'OAB-1', 'Vedação à mercantilização', 'Não trate a advocacia como produto, não use linguagem de funil de vendas agressivo e não ofereça descontos ou pacotes promocionais de serviços jurídicos.'),
  ('advogado', 'OAB-2', 'Sem garantia de resultado', 'Nunca prometa êxito, indenização certa, ganho de causa ou resultado específico em processo judicial ou administrativo.'),
  ('advogado', 'OAB-3', 'Sem captação ilícita', 'Não convide o público a contratar o escritório de forma ostensiva; o CTA deve educar e convidar ao esclarecimento, não à captação mercantil.'),
  ('medico', 'CFM-1', 'Sem milagre ou cura', 'Não prometa cura, resultado estético garantido, antes/depois milagroso ou procedimento infalível.'),
  ('medico', 'CFM-2', 'Conteúdo educativo', 'Mantenha tom científico-educativo, cite que cada caso é individual e que diagnóstico exige avaliação presencial.'),
  ('medico', 'CFM-3', 'Sem autopropaganda excessiva', 'Evite autopromoção de técnica exclusiva, títulos não reconhecidos ou comparação depreciativa com colegas.'),
  ('contador', 'CRC-1', 'Sem elisão agressiva', 'Não ensine sonegação, atalhos fiscais ilegais ou garantia de restituição/economia tributária.'),
  ('contador', 'CRC-2', 'Responsabilidade técnica', 'Deixe claro que obrigações acessórias e regimes tributários dependem da situação do contribuinte.'),
  ('corretor', 'CRECI-1', 'Sem garantia de valorização', 'Não prometa rentabilidade, valorização imobiliária ou lucro certo em investimento.'),
  ('corretor', 'CRECI-2', 'Transparência', 'Não oculte riscos, prazos ou custos; evite pressão de escassez falsa.'),
  ('dentista', 'CFO-1', 'Sem resultado estético garantido', 'Não prometa sorriso perfeito, clareamento permanente ou ausência de dor.'),
  ('psicologo', 'CFP-1', 'Sigilo e não milagre', 'Não exponha casos identificáveis, não prometa cura emocional rápida e não diagnostique a audiência.')
on conflict (profession, code) do nothing;
