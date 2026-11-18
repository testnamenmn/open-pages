-- Open Pages: metrics (what you track) + metric_points (timestamped values).
-- Run after 0001_pages.sql.

create table if not exists public.metrics (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages (id) on delete cascade,
  key         text not null check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(key) <= 40),
  label       text not null check (char_length(label) between 1 and 60),
  kind        text not null check (kind in ('number', 'checkin')),
  unit        text not null default '' check (char_length(unit) <= 20),
  created_at  timestamptz not null default now(),
  unique (page_id, key)
);

create table if not exists public.metric_points (
  id         bigint generated always as identity primary key,
  metric_id  uuid not null references public.metrics (id) on delete cascade,
  ts         timestamptz not null default now(),
  value      numeric not null check (value between -1e12 and 1e12)
);

create index if not exists metric_points_metric_ts_idx on public.metric_points (metric_id, ts desc);

alter table public.metrics enable row level security;
alter table public.metric_points enable row level security;

-- READ: a metric is visible to whoever can see its page. The subselect runs under
-- the caller's own RLS on public.pages, so: anyone sees public pages' metrics,
-- owners also see their private pages' metrics.
create policy "metrics readable when page readable"
  on public.metrics for select
  using (exists (select 1 from public.pages p where p.id = metrics.page_id));

create policy "points readable when metric readable"
  on public.metric_points for select
  using (exists (select 1 from public.metrics m where m.id = metric_points.metric_id));

-- WRITE: owners only.
create policy "owners manage metrics"
  on public.metrics for all
  using (exists (select 1 from public.pages p where p.id = metrics.page_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pages p where p.id = metrics.page_id and p.owner_id = auth.uid()));

create policy "owners manage points"
  on public.metric_points for all
  using (exists (
    select 1 from public.metrics m join public.pages p on p.id = m.page_id
    where m.id = metric_points.metric_id and p.owner_id = auth.uid()))
  with check (exists (
    select 1 from public.metrics m join public.pages p on p.id = m.page_id
    where m.id = metric_points.metric_id and p.owner_id = auth.uid()));

grant select on public.metrics, public.metric_points to anon;
grant select, insert, update, delete on public.metrics, public.metric_points to authenticated;

-- Abuse limits: 20 metrics per page, 5000 points per metric.
create or replace function public.enforce_metric_limits() returns trigger
language plpgsql as $$
begin
  if tg_table_name = 'metrics' then
    if (select count(*) from public.metrics where page_id = new.page_id) >= 20 then
      raise exception 'metric limit reached (20 per page)';
    end if;
  else
    if (select count(*) from public.metric_points where metric_id = new.metric_id) >= 5000 then
      raise exception 'point limit reached (5000 per metric)';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists metrics_limit on public.metrics;
create trigger metrics_limit before insert on public.metrics
  for each row execute function public.enforce_metric_limits();

drop trigger if exists metric_points_limit on public.metric_points;
create trigger metric_points_limit before insert on public.metric_points
  for each row execute function public.enforce_metric_limits();
