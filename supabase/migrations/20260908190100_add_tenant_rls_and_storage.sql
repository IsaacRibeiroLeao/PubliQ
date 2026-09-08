alter table public.subscriptions
  add constraint subscriptions_id_workspace_unique unique (id, workspace_id);
alter table public.brands
  add constraint brands_id_workspace_unique unique (id, workspace_id);
alter table public.media_uploads
  add constraint media_uploads_id_workspace_unique unique (id, workspace_id);
alter table public.generations
  add constraint generations_id_workspace_unique unique (id, workspace_id);
alter table public.schedules
  add constraint schedules_id_workspace_unique unique (id, workspace_id);

alter table public.payment_transactions
  add constraint payment_transactions_subscription_workspace_fk
  foreign key (subscription_id, workspace_id)
  references public.subscriptions (id, workspace_id) on delete cascade;
alter table public.meta_connections
  add constraint meta_connections_brand_workspace_fk
  foreign key (brand_id, workspace_id)
  references public.brands (id, workspace_id) on delete cascade;
alter table public.media_uploads
  add constraint media_uploads_brand_workspace_fk
  foreign key (brand_id, workspace_id)
  references public.brands (id, workspace_id) on delete cascade;
alter table public.generations
  add constraint generations_upload_workspace_fk
  foreign key (media_upload_id, workspace_id)
  references public.media_uploads (id, workspace_id) on delete cascade;
alter table public.approval_links
  add constraint approval_links_generation_workspace_fk
  foreign key (generation_id, workspace_id)
  references public.generations (id, workspace_id) on delete cascade;
alter table public.approval_decisions
  add constraint approval_decisions_generation_workspace_fk
  foreign key (generation_id, workspace_id)
  references public.generations (id, workspace_id) on delete cascade;
alter table public.schedules
  add constraint schedules_generation_workspace_fk
  foreign key (generation_id, workspace_id)
  references public.generations (id, workspace_id);
alter table public.publication_attempts
  add constraint publication_attempts_schedule_workspace_fk
  foreign key (schedule_id, workspace_id)
  references public.schedules (id, workspace_id) on delete cascade;
alter table public.ad_campaign_configs
  add constraint ad_campaign_configs_generation_workspace_fk
  foreign key (generation_id, workspace_id)
  references public.generations (id, workspace_id);

create or replace function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = target_workspace_id
      and member.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_workspace_role(
  target_workspace_id uuid,
  allowed_roles public.workspace_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = target_workspace_id
      and member.user_id = (select auth.uid())
      and member.role = any(allowed_roles)
  );
$$;

create or replace function private.workspace_has_members(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members member
    where member.workspace_id = target_workspace_id
  );
$$;

create or replace function private.enforce_workspace_member_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.workspace_role;
  remaining_owner_count integer;
  target_workspace_id uuid;
  owner_transition boolean;
  workspace_exists boolean;
begin
  if tg_op = 'INSERT' then
    target_workspace_id := new.workspace_id;
    owner_transition := new.role = 'OWNER';
  elsif tg_op = 'UPDATE' then
    if new.workspace_id <> old.workspace_id or new.user_id <> old.user_id then
      raise insufficient_privilege
        using message = 'workspace membership identity is immutable';
    end if;

    target_workspace_id := old.workspace_id;
    owner_transition := old.role = 'OWNER' or new.role = 'OWNER';
  else
    target_workspace_id := old.workspace_id;
    owner_transition := old.role = 'OWNER';
  end if;

  if owner_transition then
    perform pg_advisory_xact_lock(
      hashtextextended(target_workspace_id::text, 0)
    );

    select exists (
      select 1
      from public.workspaces workspace
      where workspace.id = target_workspace_id
    )
    into workspace_exists;

    if workspace_exists and (
      tg_op = 'DELETE'
      or (tg_op = 'UPDATE' and old.role = 'OWNER' and new.role <> 'OWNER')
    ) then
      select count(*)
      into remaining_owner_count
      from public.workspace_members member
      where member.workspace_id = target_workspace_id
        and member.role = 'OWNER'
        and member.user_id <> old.user_id;

      if remaining_owner_count = 0 then
        raise insufficient_privilege
          using message = 'workspace must retain an OWNER membership';
      end if;
    end if;
  end if;

  if actor_id is null then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'INSERT' then
    if (
      new.user_id = actor_id
      and new.role = 'OWNER'
      and not private.workspace_has_members(new.workspace_id)
    ) then
      return new;
    end if;

    select member.role
    into actor_role
    from public.workspace_members member
    where member.workspace_id = new.workspace_id
      and member.user_id = actor_id;

    if actor_role = 'OWNER' or (actor_role = 'ADMIN' and new.role <> 'OWNER') then
      return new;
    end if;
  elsif tg_op = 'UPDATE' then
    select member.role
    into actor_role
    from public.workspace_members member
    where member.workspace_id = old.workspace_id
      and member.user_id = actor_id;

    if (
      actor_role = 'OWNER'
      or (
        actor_role = 'ADMIN'
        and old.role <> 'OWNER'
        and new.role <> 'OWNER'
      )
    ) then
      return new;
    end if;
  elsif tg_op = 'DELETE' then
    select member.role
    into actor_role
    from public.workspace_members member
    where member.workspace_id = old.workspace_id
      and member.user_id = actor_id;

    if actor_role = 'OWNER' or (actor_role = 'ADMIN' and old.role <> 'OWNER') then
      return old;
    end if;
  end if;

  raise insufficient_privilege
    using message = 'workspace membership transition is not authorized';
end;
$$;

create trigger workspace_members_enforce_transition
before insert or update or delete on public.workspace_members
for each row execute function private.enforce_workspace_member_transition();

revoke all on function private.is_workspace_member(uuid) from public;
revoke all on function private.has_workspace_role(uuid, public.workspace_role[]) from public;
revoke all on function private.workspace_has_members(uuid) from public;
revoke all on function private.enforce_workspace_member_transition() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, public.workspace_role[]) to authenticated;
grant execute on function private.workspace_has_members(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.usage_periods enable row level security;
alter table public.brands enable row level security;
alter table public.meta_connections enable row level security;
alter table public.media_uploads enable row level security;
alter table public.generations enable row level security;
alter table public.approval_links enable row level security;
alter table public.approval_decisions enable row level security;
alter table public.schedules enable row level security;
alter table public.publication_attempts enable row level security;
alter table public.ad_campaign_configs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles read self"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "profiles update self"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "workspaces create authenticated"
on public.workspaces for insert to authenticated
with check ((select auth.uid()) is not null);

create policy "workspaces read members"
on public.workspaces for select to authenticated
using (private.is_workspace_member(id));

create policy "workspaces update admins"
on public.workspaces for update to authenticated
using (
  private.has_workspace_role(
    id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
)
with check (
  private.has_workspace_role(
    id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "workspaces delete owners"
on public.workspaces for delete to authenticated
using (
  private.has_workspace_role(id, array['OWNER']::public.workspace_role[])
);

create policy "workspace members read members"
on public.workspace_members for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "workspace members insert authorized"
on public.workspace_members for insert to authenticated
with check (
  (
    user_id = (select auth.uid())
    and role = 'OWNER'
    and not private.workspace_has_members(workspace_id)
  )
  or private.has_workspace_role(
      workspace_id,
      array['OWNER']::public.workspace_role[]
    )
  or (
    role <> 'OWNER'
    and private.has_workspace_role(
      workspace_id,
      array['ADMIN']::public.workspace_role[]
    )
  )
);

create policy "workspace members update authorized"
on public.workspace_members for update to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER']::public.workspace_role[]
  )
  or (
    role <> 'OWNER'
    and private.has_workspace_role(
      workspace_id,
      array['ADMIN']::public.workspace_role[]
    )
  )
)
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER']::public.workspace_role[]
  )
  or (
    role <> 'OWNER'
    and private.has_workspace_role(
      workspace_id,
      array['ADMIN']::public.workspace_role[]
    )
  )
);

create policy "workspace members delete authorized"
on public.workspace_members for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER']::public.workspace_role[]
  )
  or (
    role <> 'OWNER'
    and private.has_workspace_role(
      workspace_id,
      array['ADMIN']::public.workspace_role[]
    )
  )
);

create policy "plans read authenticated"
on public.plans for select to authenticated
using (active);

create policy "subscriptions read members"
on public.subscriptions for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "payment transactions read admins"
on public.payment_transactions for select to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "usage periods read members"
on public.usage_periods for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "brands read members"
on public.brands for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "brands insert editors"
on public.brands for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "brands update editors"
on public.brands for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "brands delete admins"
on public.brands for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "meta connections read members"
on public.meta_connections for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "meta connections insert admins"
on public.meta_connections for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);
create policy "meta connections update admins"
on public.meta_connections for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);
create policy "meta connections delete admins"
on public.meta_connections for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "media uploads read members"
on public.media_uploads for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "media uploads insert editors"
on public.media_uploads for insert to authenticated
with check (
  uploaded_by_id = (select auth.uid())
  and private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "media uploads update editors"
on public.media_uploads for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "media uploads delete admins"
on public.media_uploads for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "generations read members"
on public.generations for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "generations insert editors"
on public.generations for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "generations update editors"
on public.generations for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);

create policy "approval links read members"
on public.approval_links for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "approval links insert editors"
on public.approval_links for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "approval links update editors"
on public.approval_links for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);

create policy "approval decisions read members"
on public.approval_decisions for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "schedules read members"
on public.schedules for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "schedules insert editors"
on public.schedules for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "schedules update editors"
on public.schedules for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);
create policy "schedules delete admins"
on public.schedules for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "publication attempts read members"
on public.publication_attempts for select to authenticated
using (private.is_workspace_member(workspace_id));

create policy "ad campaign configs read members"
on public.ad_campaign_configs for select to authenticated
using (private.is_workspace_member(workspace_id));
create policy "ad campaign configs insert admins"
on public.ad_campaign_configs for insert to authenticated
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);
create policy "ad campaign configs update admins"
on public.ad_campaign_configs for update to authenticated
using (private.is_workspace_member(workspace_id))
with check (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);
create policy "ad campaign configs delete admins"
on public.ad_campaign_configs for delete to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

create policy "audit logs read admins"
on public.audit_logs for select to authenticated
using (
  private.has_workspace_role(
    workspace_id,
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);

grant select, insert, update, delete
on all tables in schema public
to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke select on public.meta_connections from authenticated;
grant select (
  id,
  workspace_id,
  brand_id,
  status,
  page_id,
  instagram_account_id,
  ad_account_id,
  scopes,
  token_expires_at,
  last_validated_at,
  created_at,
  updated_at
) on public.meta_connections to authenticated;

create view public.meta_connection_summaries
with (security_invoker = true)
as
select
  id,
  workspace_id,
  brand_id,
  status,
  page_id,
  instagram_account_id,
  ad_account_id,
  scopes,
  token_expires_at,
  last_validated_at,
  created_at,
  updated_at
from public.meta_connections;

grant select on public.meta_connection_summaries to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  52428800,
  array['image/png', 'image/jpeg', 'video/mp4']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "workspace media read members"
on storage.objects for select to authenticated
using (
  bucket_id = 'media'
  and private.is_workspace_member(
    (
      select member.workspace_id
      from public.workspace_members member
      where member.user_id = (select auth.uid())
        and member.workspace_id::text = (storage.foldername(name))[1]
      limit 1
    )
  )
);

create policy "workspace media insert editors"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'media'
  and array_length(storage.foldername(name), 1) >= 3
  and private.has_workspace_role(
    (
      select member.workspace_id
      from public.workspace_members member
      where member.user_id = (select auth.uid())
        and member.workspace_id::text = (storage.foldername(name))[1]
      limit 1
    ),
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);

create policy "workspace media update editors"
on storage.objects for update to authenticated
using (
  bucket_id = 'media'
  and private.is_workspace_member(
    (
      select member.workspace_id
      from public.workspace_members member
      where member.user_id = (select auth.uid())
        and member.workspace_id::text = (storage.foldername(name))[1]
      limit 1
    )
  )
)
with check (
  bucket_id = 'media'
  and private.has_workspace_role(
    (
      select member.workspace_id
      from public.workspace_members member
      where member.user_id = (select auth.uid())
        and member.workspace_id::text = (storage.foldername(name))[1]
      limit 1
    ),
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  )
);

create policy "workspace media delete admins"
on storage.objects for delete to authenticated
using (
  bucket_id = 'media'
  and private.has_workspace_role(
    (
      select member.workspace_id
      from public.workspace_members member
      where member.user_id = (select auth.uid())
        and member.workspace_id::text = (storage.foldername(name))[1]
      limit 1
    ),
    array['OWNER', 'ADMIN']::public.workspace_role[]
  )
);
