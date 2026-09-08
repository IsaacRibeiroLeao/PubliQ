create or replace function public.create_brand_with_plan_limit(
  p_workspace_id uuid,
  p_name text,
  p_niche text,
  p_value_proposition text,
  p_persona jsonb,
  p_target_audience text,
  p_tone_of_voice text,
  p_voice_examples text[],
  p_forbidden_words text[]
)
returns public.brands
language plpgsql
security invoker
set search_path = ''
as $$
declare
  workspace_brand_limit integer;
  workspace_brand_count bigint;
  created_brand public.brands;
begin
  if not private.has_workspace_role(
    p_workspace_id,
    array['OWNER', 'ADMIN', 'EDITOR']::public.workspace_role[]
  ) then
    raise exception using errcode = '42501', message = 'workspace_access_denied';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text, 0));

  select plan.brand_limit
  into workspace_brand_limit
  from public.subscriptions subscription
  join public.plans plan on plan.id = subscription.plan_id
  where subscription.workspace_id = p_workspace_id;

  if workspace_brand_limit is null then
    raise exception using errcode = 'P0001', message = 'workspace_plan_missing';
  end if;

  select count(*)
  into workspace_brand_count
  from public.brands brand
  where brand.workspace_id = p_workspace_id;

  if workspace_brand_count >= workspace_brand_limit then
    raise exception using errcode = 'P0001', message = 'brand_limit_reached';
  end if;

  insert into public.brands (
    workspace_id,
    name,
    niche,
    value_proposition,
    persona,
    target_audience,
    tone_of_voice,
    voice_examples,
    forbidden_words
  )
  values (
    p_workspace_id,
    p_name,
    p_niche,
    p_value_proposition,
    p_persona,
    p_target_audience,
    p_tone_of_voice,
    p_voice_examples,
    p_forbidden_words
  )
  returning * into created_brand;

  return created_brand;
end;
$$;

revoke execute on function public.create_brand_with_plan_limit(
  uuid, text, text, text, jsonb, text, text, text[], text[]
) from public, anon;
grant execute on function public.create_brand_with_plan_limit(
  uuid, text, text, text, jsonb, text, text, text[], text[]
) to authenticated;
