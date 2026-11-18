-- Open Pages: published pages table + row level security.
-- Run in the Supabase dashboard (SQL Editor) or via `supabase db push`.

create table if not exists public.pages (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  client_id   text not null,                       -- id used by the builder in the browser
  slug        text not null unique
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 40),
  is_public   boolean not null default true,
  data        jsonb not null,                      -- full OpenPage document
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (owner_id, client_id)
);

create index if not exists pages_owner_idx on public.pages (owner_id);

alter table public.pages enable row level security;

-- Anyone (including logged-out visitors) can read public pages.
create policy "public pages are readable by everyone"
  on public.pages for select
  using (is_public = true);

-- Owners can always read their own pages (including private ones).
create policy "owners can read their pages"
  on public.pages for select
  using (auth.uid() = owner_id);

create policy "owners can insert their pages"
  on public.pages for insert
  with check (auth.uid() = owner_id);

create policy "owners can update their pages"
  on public.pages for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "owners can delete their pages"
  on public.pages for delete
  using (auth.uid() = owner_id);

-- Keep updated_at fresh.
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists pages_touch on public.pages;
create trigger pages_touch before update on public.pages
  for each row execute function public.touch_updated_at();

-- Table privileges for the Data API roles (required on newer Supabase projects;
-- row level security above still decides which rows each role can touch).
grant usage on schema public to anon, authenticated;
grant select on public.pages to anon;
grant select, insert, update, delete on public.pages to authenticated;
