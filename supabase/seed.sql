insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'demo@publiq.local',
  crypt('publiq-demo-2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Isaac Demo"}'::jsonb,
  '2026-01-15T12:00:00Z',
  '2026-01-15T12:00:00Z'
)
on conflict (id) do update
set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into public.profiles (id, email, name, created_at, updated_at)
values (
  '00000000-0000-4000-8000-000000000001',
  'demo@publiq.local',
  'Isaac Demo',
  '2026-01-15T12:00:00Z',
  '2026-01-15T12:00:00Z'
)
on conflict (id) do update
set email = excluded.email, name = excluded.name, updated_at = excluded.updated_at;

insert into public.plans (
  id,
  name,
  version,
  price_cents,
  brand_limit,
  creative_limit,
  allows_ads,
  allows_white_label,
  active
)
values
  ('starter-v1', 'Starter', 1, 9700, 3, 30, false, false, true),
  ('pro-v1', 'Pro', 1, 24700, 10, 120, true, false, true),
  ('agency-v1', 'Agency', 1, 59700, 30, 500, true, true, true)
on conflict (id) do update
set
  price_cents = excluded.price_cents,
  brand_limit = excluded.brand_limit,
  creative_limit = excluded.creative_limit,
  allows_ads = excluded.allows_ads,
  allows_white_label = excluded.allows_white_label,
  active = excluded.active;

insert into public.workspaces (id, name, timezone, created_at, updated_at)
values (
  '00000000-0000-4000-8000-000000000002',
  'Agência PubliQ Demo',
  'America/Sao_Paulo',
  '2026-01-15T12:00:00Z',
  '2026-01-15T12:00:00Z'
)
on conflict (id) do update
set name = excluded.name, timezone = excluded.timezone;

insert into public.workspace_members (workspace_id, user_id, role, created_at)
values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'OWNER',
  '2026-01-15T12:00:00Z'
)
on conflict (workspace_id, user_id) do update set role = excluded.role;

insert into public.brands (
  id,
  workspace_id,
  name,
  niche,
  value_proposition,
  persona,
  target_audience,
  tone_of_voice,
  voice_examples,
  forbidden_words,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000002',
  'Café Aurora',
  'Cafeteria artesanal',
  'Café especial brasileiro, simples e acolhedor.',
  '{"name":"Marina","goal":"descobrir cafés de origem sem complicação"}'::jsonb,
  'Adultos de 25 a 45 anos interessados em café especial',
  'Próximo, otimista e direto',
  array['Seu café de todo dia pode ter uma origem extraordinária.'],
  array['imperdível', 'milagre'],
  '2026-01-15T12:00:00Z',
  '2026-01-15T12:00:00Z'
)
on conflict (id) do update
set
  name = excluded.name,
  persona = excluded.persona,
  updated_at = excluded.updated_at;

insert into public.usage_periods (
  id,
  workspace_id,
  period_start,
  period_end,
  creative_limit,
  reserved_creatives,
  used_creatives,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000005',
  '00000000-0000-4000-8000-000000000002',
  '2026-01-01T00:00:00Z',
  '2026-02-01T00:00:00Z',
  120,
  0,
  1,
  '2026-01-15T12:00:00Z',
  '2026-01-15T12:00:00Z'
)
on conflict (workspace_id, period_start) do update
set creative_limit = excluded.creative_limit, used_creatives = excluded.used_creatives;

insert into public.media_uploads (
  id,
  workspace_id,
  brand_id,
  uploaded_by_id,
  storage_bucket,
  storage_key,
  original_name,
  mime_type,
  byte_size,
  checksum_sha256,
  status,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000001',
  'media',
  '00000000-0000-4000-8000-000000000002/00000000-0000-4000-8000-000000000003/00000000-0000-4000-8000-000000000004/demo-cafe.jpg',
  'demo-cafe.jpg',
  'image/jpeg',
  245760,
  'dd7d8f969cab5168b61471c8fdca0767d3709d0c1fa110e766d5c43448f49831',
  'ready',
  '2026-01-15T12:00:00Z',
  '2026-01-15T12:00:00Z'
)
on conflict (id) do update
set status = excluded.status, updated_at = excluded.updated_at;
