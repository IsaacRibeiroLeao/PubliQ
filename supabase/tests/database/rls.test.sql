begin;

create extension if not exists pgtap with schema extensions;
create extension if not exists dblink with schema extensions;

select plan(27);

create or replace function pg_temp.rls_rejected(statement text)
returns boolean
language plpgsql
as $$
begin
  execute statement;
  return false;
exception
  when others then
    return sqlstate = '42501';
end;
$$;

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
select
  '00000000-0000-0000-0000-000000000000',
  fixture.id,
  'authenticated',
  'authenticated',
  fixture.email,
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('name', fixture.name),
  now(),
  now()
from (
  values
    ('20000000-0000-4000-8000-000000000010'::uuid, 'admin@publiq.test', 'Admin'),
    ('20000000-0000-4000-8000-000000000011'::uuid, 'editor@publiq.test', 'Editor'),
    ('20000000-0000-4000-8000-000000000012'::uuid, 'viewer@publiq.test', 'Viewer'),
    ('20000000-0000-4000-8000-000000000013'::uuid, 'candidate@publiq.test', 'Candidate'),
    ('20000000-0000-4000-8000-000000000014'::uuid, 'owner-add@publiq.test', 'Owner Add'),
    ('20000000-0000-4000-8000-000000000015'::uuid, 'owner-delete@publiq.test', 'Owner Delete'),
    ('20000000-0000-4000-8000-000000000016'::uuid, 'foreign@publiq.test', 'Foreign Owner'),
    ('20000000-0000-4000-8000-000000000017'::uuid, 'owner-denied@publiq.test', 'Owner Denied'),
    ('20000000-0000-4000-8000-000000000018'::uuid, 'bootstrap@publiq.test', 'Bootstrap Owner')
) as fixture(id, email, name);

insert into public.workspaces (id, name)
values
  ('11111111-1111-4111-8111-111111111111', 'Tenant isolado'),
  ('30000000-0000-4000-8000-000000000001', 'Workspace bootstrap');

insert into public.workspace_members (workspace_id, user_id, role)
values
  (
    '00000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000010',
    'ADMIN'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000011',
    'EDITOR'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000012',
    'VIEWER'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '20000000-0000-4000-8000-000000000016',
    'OWNER'
  );

insert into public.brands (
  id,
  workspace_id,
  name,
  niche,
  value_proposition,
  persona,
  target_audience,
  tone_of_voice
)
values (
  '11111111-1111-4111-8111-111111111112',
  '11111111-1111-4111-8111-111111111111',
  'Marca isolada',
  'Teste',
  'Teste de isolamento',
  '{}'::jsonb,
  'Teste',
  'Direto'
);

insert into storage.objects (bucket_id, name)
values (
  'media',
  '11111111-1111-4111-8111-111111111111/11111111-1111-4111-8111-111111111112/11111111-1111-4111-8111-111111111113/foreign.jpg'
);

set local role authenticated;
set local request.jwt.claims =
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}';

select results_eq(
  'select count(*) from public.workspaces',
  array[1::bigint],
  'authenticated user only sees member workspaces'
);

select results_eq(
  'select count(*) from public.brands',
  array[1::bigint],
  'authenticated user cannot read another tenant brand'
);

set local request.jwt.claims =
  '{"sub":"20000000-0000-4000-8000-000000000018","role":"authenticated"}';

select lives_ok(
  $$
    insert into public.workspace_members (workspace_id, user_id, role)
    values (
      '30000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000018',
      'OWNER'
    )
  $$,
  'first workspace member can bootstrap as self OWNER'
);

select ok(
  pg_temp.rls_rejected(
    $$
      delete from public.workspace_members
      where workspace_id = '30000000-0000-4000-8000-000000000001'
        and user_id = '20000000-0000-4000-8000-000000000018'
    $$
  ),
  'the last OWNER membership cannot be deleted'
);

set local request.jwt.claims =
  '{"sub":"20000000-0000-4000-8000-000000000010","role":"authenticated"}';

select lives_ok(
  $$
    insert into public.workspace_members (workspace_id, user_id, role)
    values (
      '00000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000013',
      'EDITOR'
    )
  $$,
  'ADMIN can add a lower-role membership'
);

select ok(
  pg_temp.rls_rejected(
    $$
      insert into public.workspace_members (workspace_id, user_id, role)
      values (
        '00000000-0000-4000-8000-000000000002',
        '20000000-0000-4000-8000-000000000017',
        'OWNER'
      )
    $$
  ),
  'ADMIN cannot insert an OWNER membership'
);

select is_empty(
  $$
    update public.workspace_members
    set role = 'ADMIN'
    where workspace_id = '00000000-0000-4000-8000-000000000002'
      and user_id = '00000000-0000-4000-8000-000000000001'
    returning user_id
  $$,
  'ADMIN cannot update an OWNER membership'
);

select ok(
  pg_temp.rls_rejected(
    $$
      update public.workspace_members
      set role = 'OWNER'
      where workspace_id = '00000000-0000-4000-8000-000000000002'
        and user_id = '20000000-0000-4000-8000-000000000013'
    $$
  ),
  'ADMIN cannot promote a lower membership to OWNER'
);

select is_empty(
  $$
    delete from public.workspace_members
    where workspace_id = '00000000-0000-4000-8000-000000000002'
      and user_id = '00000000-0000-4000-8000-000000000001'
    returning user_id
  $$,
  'ADMIN cannot delete an OWNER membership'
);

select ok(
  pg_temp.rls_rejected(
    $$
      update public.workspace_members
      set role = 'OWNER'
      where workspace_id = '00000000-0000-4000-8000-000000000002'
        and user_id = '20000000-0000-4000-8000-000000000010'
    $$
  ),
  'ADMIN cannot promote their own membership to OWNER'
);

set local request.jwt.claims =
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}';

select lives_ok(
  $$
    insert into public.workspace_members (workspace_id, user_id, role)
    values (
      '00000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000014',
      'OWNER'
    )
  $$,
  'OWNER can add another OWNER'
);

select lives_ok(
  $$
    update public.workspace_members
    set role = 'ADMIN'
    where workspace_id = '00000000-0000-4000-8000-000000000002'
      and user_id = '20000000-0000-4000-8000-000000000014'
  $$,
  'OWNER can change another OWNER membership'
);

select lives_ok(
  $$
    insert into public.workspace_members (workspace_id, user_id, role)
    values (
      '00000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000015',
      'OWNER'
    )
  $$,
  'OWNER can create a removable OWNER membership'
);

select lives_ok(
  $$
    delete from public.workspace_members
    where workspace_id = '00000000-0000-4000-8000-000000000002'
      and user_id = '20000000-0000-4000-8000-000000000015'
  $$,
  'OWNER can delete another OWNER membership'
);

set local request.jwt.claims =
  '{"sub":"20000000-0000-4000-8000-000000000011","role":"authenticated"}';

select lives_ok(
  $$
    insert into public.brands (
      workspace_id,
      name,
      niche,
      value_proposition,
      persona,
      target_audience,
      tone_of_voice
    )
    values (
      '00000000-0000-4000-8000-000000000002',
      'Marca do editor',
      'Teste',
      'Escrita permitida',
      '{}'::jsonb,
      'Teste',
      'Direto'
    )
  $$,
  'EDITOR can insert a brand in their workspace'
);

set local request.jwt.claims =
  '{"sub":"20000000-0000-4000-8000-000000000012","role":"authenticated"}';

select ok(
  pg_temp.rls_rejected(
    $$
      insert into public.brands (
        workspace_id,
        name,
        niche,
        value_proposition,
        persona,
        target_audience,
        tone_of_voice
      )
      values (
        '00000000-0000-4000-8000-000000000002',
        'Marca do viewer',
        'Teste',
        'Escrita negada',
        '{}'::jsonb,
        'Teste',
        'Direto'
      )
    $$
  ),
  'VIEWER cannot insert a brand'
);

set local request.jwt.claims =
  '{"sub":"20000000-0000-4000-8000-000000000010","role":"authenticated"}';

select ok(
  pg_temp.rls_rejected(
    $$
      insert into public.brands (
        workspace_id,
        name,
        niche,
        value_proposition,
        persona,
        target_audience,
        tone_of_voice
      )
      values (
        '11111111-1111-4111-8111-111111111111',
        'Inserção cruzada',
        'Teste',
        'Negada',
        '{}'::jsonb,
        'Teste',
        'Direto'
      )
    $$
  ),
  'cross-tenant brand insert is denied'
);

select is_empty(
  $$
    update public.brands
    set name = 'Atualização cruzada'
    where id = '11111111-1111-4111-8111-111111111112'
    returning id
  $$,
  'cross-tenant brand update is denied'
);

select is_empty(
  $$
    delete from public.brands
    where id = '11111111-1111-4111-8111-111111111112'
    returning id
  $$,
  'cross-tenant brand delete is denied'
);

set local request.jwt.claims =
  '{"sub":"20000000-0000-4000-8000-000000000011","role":"authenticated"}';

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name)
    values (
      'media',
      '00000000-0000-4000-8000-000000000002/00000000-0000-4000-8000-000000000003/20000000-0000-4000-8000-000000000020/allowed.jpg'
    )
  $$,
  'EDITOR can insert a correctly prefixed media object'
);

select ok(
  pg_temp.rls_rejected(
    $$
      insert into storage.objects (bucket_id, name)
      values (
        'media',
        '11111111-1111-4111-8111-111111111111/11111111-1111-4111-8111-111111111112/20000000-0000-4000-8000-000000000021/denied.jpg'
      )
    $$
  ),
  'foreign workspace storage prefix is denied'
);

select ok(
  pg_temp.rls_rejected(
    $$
      insert into storage.objects (bucket_id, name)
      values (
        'media',
        '00000000-0000-4000-8000-000000000002/invalid.jpg'
      )
    $$
  ),
  'malformed storage path is denied'
);

select is_empty(
  $$
    update storage.objects
    set metadata = '{"attempted":true}'::jsonb
    where bucket_id = 'media'
      and name like '11111111-1111-4111-8111-111111111111/%'
    returning id
  $$,
  'foreign workspace storage update is denied'
);

set local storage.allow_delete_query = 'true';

select is_empty(
  $$
    delete from storage.objects
    where bucket_id = 'media'
      and name like '11111111-1111-4111-8111-111111111111/%'
    returning id
  $$,
  'foreign workspace storage delete is denied'
);

reset role;

do $$
begin
  perform extensions.dblink_connect(
    'owner_lock_probe',
    'host=host.docker.internal port=54322 dbname=postgres user=postgres password=postgres'
  );
end;
$$;

select is(
  (
    select lock_acquired
    from extensions.dblink(
      'owner_lock_probe',
      $$
        select pg_try_advisory_xact_lock(
          hashtextextended('00000000-0000-4000-8000-000000000002', 0)
        )
      $$
    ) as lock_result(lock_acquired boolean)
  ),
  false,
  'OWNER transition holds the workspace advisory lock until transaction end'
);

select is(
  (
    select lock_acquired
    from extensions.dblink(
      'owner_lock_probe',
      $$
        select pg_try_advisory_xact_lock(
          hashtextextended('40000000-0000-4000-8000-000000000001', 0)
        )
      $$
    ) as lock_result(lock_acquired boolean)
  ),
  true,
  'OWNER transition does not lock unrelated workspaces'
);

do $$
begin
  perform extensions.dblink_disconnect('owner_lock_probe');
end;
$$;

select is(
  (
    select count(*)::integer
    from pg_class relation
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind = 'r'
      and relation.relname in (
        'profiles',
        'workspaces',
        'workspace_members',
        'plans',
        'subscriptions',
        'payment_transactions',
        'usage_periods',
        'brands',
        'meta_connections',
        'media_uploads',
        'generations',
        'approval_links',
        'approval_decisions',
        'schedules',
        'publication_attempts',
        'ad_campaign_configs',
        'webhook_events',
        'audit_logs'
      )
      and relation.relrowsecurity
  ),
  18,
  'RLS is enabled on every public MVP table'
);

select * from finish();
rollback;
