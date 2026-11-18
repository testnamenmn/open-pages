-- Open Pages: metrics fed by GitHub public data + sync_metric_points().
-- Run after 0003_api_keys.sql. Safe to run more than once.

alter table public.metrics add column if not exists source      text not null default 'manual';
alter table public.metrics add column if not exists source_ref  text;   -- e.g. the GitHub username
alter table public.metrics add column if not exists source_stat text;   -- e.g. 'pushes', 'followers'
alter table public.metrics add column if not exists synced_at   timestamptz;

alter table public.metrics drop constraint if exists metrics_source_check;
alter table public.metrics add constraint metrics_source_check check (
  (source = 'manual' and source_stat is null and source_ref is null)
  or (source = 'github'
      and source_stat in ('pushes', 'active_days', 'followers', 'stars', 'repos')
      and source_ref ~ '^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$')
);

-- Writes points for a GitHub-sourced metric. SECURITY INVOKER: row level security still
-- applies, so only the page owner can use it (anyone else gets an error / no-ops).
--   p_mode = 'replace'  : delete points with ts >= p_since, then insert p_points
--   p_mode = 'snapshot' : append p_points[0] unless it equals the latest value
--                         and that latest point is under 24h old
create or replace function public.sync_metric_points(
  p_metric uuid,
  p_mode   text,
  p_since  timestamptz,
  p_points jsonb
) returns void
language plpgsql
security invoker
as $$
declare
  v_source text;
  v_last   record;
  v_new    numeric;
begin
  select source into v_source from public.metrics where id = p_metric;
  if v_source is null then
    raise exception 'metric not found or not yours';
  end if;
  if v_source <> 'github' then
    raise exception 'only GitHub-sourced metrics can be synced';
  end if;
  if jsonb_typeof(p_points) <> 'array' or jsonb_array_length(p_points) > 400 then
    raise exception 'invalid points payload';
  end if;

  if p_mode = 'replace' then
    delete from public.metric_points where metric_id = p_metric and ts >= p_since;
    insert into public.metric_points (metric_id, ts, value)
      select p_metric, x.ts, x.value
      from jsonb_to_recordset(p_points) as x(ts timestamptz, value numeric);

  elsif p_mode = 'snapshot' then
    v_new := (p_points -> 0 ->> 'value')::numeric;
    select ts, value into v_last from public.metric_points
      where metric_id = p_metric order by ts desc limit 1;
    if v_new is not null and (v_last is null or v_last.value <> v_new or v_last.ts < now() - interval '24 hours') then
      insert into public.metric_points (metric_id, value) values (p_metric, v_new);
    end if;

  else
    raise exception 'unknown mode';
  end if;

  update public.metrics set synced_at = now() where id = p_metric;
end $$;

revoke all on function public.sync_metric_points(uuid, text, timestamptz, jsonb) from public;
grant execute on function public.sync_metric_points(uuid, text, timestamptz, jsonb) to authenticated;
