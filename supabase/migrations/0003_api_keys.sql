-- Open Pages: per-page API keys + log_metric_with_key() used by POST /api/metric.
-- Run after 0002_metrics.sql.
--
-- The plaintext key is generated in the owner's browser and shown once. Only its
-- SHA-256 hash is stored here, so a database leak does not leak working keys.

create table if not exists public.page_api_keys (
  page_id       uuid primary key references public.pages (id) on delete cascade,  -- one active key per page
  key_hash      text not null unique,                 -- hex sha256 of the full key
  key_prefix    text not null,                        -- first chars, shown in the UI to identify the key
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  window_start  timestamptz,                          -- rate limit bookkeeping (60 requests / minute / key)
  window_count  integer not null default 0
);

alter table public.page_api_keys enable row level security;

create policy "owners manage their page keys"
  on public.page_api_keys for all
  using (exists (select 1 from public.pages p where p.id = page_api_keys.page_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pages p where p.id = page_api_keys.page_id and p.owner_id = auth.uid()));

grant select, insert, update, delete on public.page_api_keys to authenticated;
-- anon gets NO direct access: it can only call the function below.

-- Logs one point using an API key. Always returns jsonb {status: ...} instead of raising,
-- so the HTTP layer can map statuses to codes. Runs as the function owner (SECURITY DEFINER)
-- because the caller is an anonymous script, but it only ever touches the page that owns the key.
create or replace function public.log_metric_with_key(
  p_key    text,
  p_metric text,
  p_value  numeric default null,
  p_ts     timestamptz default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash    text;
  v_page    uuid;
  v_count   integer;
  v_metric  public.metrics%rowtype;
  v_value   numeric;
begin
  if p_key is null or char_length(p_key) < 20 or char_length(p_key) > 200 then
    return jsonb_build_object('status', 'invalid_key');
  end if;

  v_hash := encode(sha256(convert_to(p_key, 'UTF8')), 'hex');

  -- Authenticate + rate limit in one atomic statement.
  update public.page_api_keys k
     set last_used_at = now(),
         window_start = case when k.window_start is null or k.window_start < now() - interval '1 minute'
                             then now() else k.window_start end,
         window_count = case when k.window_start is null or k.window_start < now() - interval '1 minute'
                             then 1 else k.window_count + 1 end
   where k.key_hash = v_hash
   returning k.page_id, k.window_count into v_page, v_count;

  if v_page is null then
    return jsonb_build_object('status', 'invalid_key');
  end if;
  if v_count > 60 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  select * into v_metric from public.metrics where page_id = v_page and key = p_metric;
  if not found then
    return jsonb_build_object('status', 'metric_not_found');
  end if;

  v_value := coalesce(p_value, case when v_metric.kind = 'checkin' then 1 end);
  if v_value is null or v_value not between -1e12 and 1e12 then
    return jsonb_build_object('status', 'bad_value');
  end if;
  if v_metric.kind = 'checkin' and v_value <= 0 then
    return jsonb_build_object('status', 'bad_value');
  end if;
  if p_ts is not null and p_ts > now() + interval '5 minutes' then
    return jsonb_build_object('status', 'bad_value');
  end if;

  begin
    insert into public.metric_points (metric_id, value, ts)
    values (v_metric.id, v_value, coalesce(p_ts, now()));
  exception when raise_exception then
    return jsonb_build_object('status', 'limit_reached');   -- 5000 points per metric trigger
  end;

  return jsonb_build_object('status', 'ok', 'metric', v_metric.key, 'value', v_value);
end $$;

revoke all on function public.log_metric_with_key(text, text, numeric, timestamptz) from public;
grant execute on function public.log_metric_with_key(text, text, numeric, timestamptz) to anon, authenticated;
