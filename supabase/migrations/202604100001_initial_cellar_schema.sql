create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storage_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  rack text,
  shelf text,
  bin text,
  box text,
  fridge text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint storage_locations_user_label_unique unique (user_id, label)
);

create table if not exists public.wines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wine_name text not null,
  producer text not null,
  vintage_year integer not null check (vintage_year between 1800 and 2200),
  appellation text,
  region text,
  country text,
  varietal text,
  style_category text not null default 'red'
    check (style_category in ('red', 'white', 'rose', 'sparkling', 'dessert', 'fortified', 'orange')),
  bottle_size text,
  quantity integer not null default 1 check (quantity >= 0),
  purchase_date date,
  purchase_price numeric(12, 2),
  estimated_market_value numeric(12, 2),
  alcohol_percentage numeric(5, 2),
  drink_window_start_year integer not null check (drink_window_start_year between 1800 and 2300),
  drink_window_end_year integer not null check (drink_window_end_year between 1800 and 2300),
  best_drink_by_year integer not null check (best_drink_by_year between 1800 and 2300),
  acquisition_source text,
  status text not null default 'unopened' check (status in ('unopened', 'opened', 'consumed')),
  tasting_notes text,
  personal_rating integer check (personal_rating between 50 and 100),
  food_pairing_notes text,
  ai_advice text,
  image_url text,
  storage_location_id uuid references public.storage_locations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wines_drink_window_valid check (drink_window_end_year >= drink_window_start_year)
);

create table if not exists public.tasting_entries (
  id uuid primary key default gen_random_uuid(),
  wine_id uuid not null references public.wines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tasted_at date not null,
  notes text not null,
  rating integer check (rating between 50 and 100),
  decanted boolean not null default false,
  pairing text,
  occasion text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_advice_cache (
  id uuid primary key default gen_random_uuid(),
  wine_id uuid not null references public.wines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_context jsonb not null,
  advice jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wines_user_updated_at on public.wines(user_id, updated_at desc);
create index if not exists idx_wines_user_style on public.wines(user_id, style_category);
create index if not exists idx_wines_user_country_region on public.wines(user_id, country, region);
create index if not exists idx_wines_user_status on public.wines(user_id, status);
create index if not exists idx_wines_user_vintage on public.wines(user_id, vintage_year);
create index if not exists idx_wines_user_best_drink_by on public.wines(user_id, best_drink_by_year);
create index if not exists idx_wines_user_rating on public.wines(user_id, personal_rating);
create index if not exists idx_wines_user_storage on public.wines(user_id, storage_location_id);
create index if not exists idx_tasting_entries_wine_tasted on public.tasting_entries(wine_id, tasted_at desc);
create index if not exists idx_storage_locations_user_label on public.storage_locations(user_id, label);
create index if not exists idx_ai_advice_cache_wine_created on public.ai_advice_cache(wine_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_storage_locations_updated_at on public.storage_locations;
create trigger set_storage_locations_updated_at
before update on public.storage_locations
for each row execute function public.set_updated_at();

drop trigger if exists set_wines_updated_at on public.wines;
create trigger set_wines_updated_at
before update on public.wines
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.storage_locations enable row level security;
alter table public.wines enable row level security;
alter table public.tasting_entries enable row level security;
alter table public.ai_advice_cache enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can read their own storage locations" on public.storage_locations;
create policy "Users can read their own storage locations"
on public.storage_locations for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own storage locations" on public.storage_locations;
create policy "Users can insert their own storage locations"
on public.storage_locations for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own storage locations" on public.storage_locations;
create policy "Users can update their own storage locations"
on public.storage_locations for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own storage locations" on public.storage_locations;
create policy "Users can delete their own storage locations"
on public.storage_locations for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their own wines" on public.wines;
create policy "Users can read their own wines"
on public.wines for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own wines" on public.wines;
create policy "Users can insert their own wines"
on public.wines for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own wines" on public.wines;
create policy "Users can update their own wines"
on public.wines for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own wines" on public.wines;
create policy "Users can delete their own wines"
on public.wines for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their own tasting entries" on public.tasting_entries;
create policy "Users can read their own tasting entries"
on public.tasting_entries for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own tasting entries" on public.tasting_entries;
create policy "Users can insert their own tasting entries"
on public.tasting_entries for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.wines
    where wines.id = tasting_entries.wine_id
      and wines.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their own tasting entries" on public.tasting_entries;
create policy "Users can update their own tasting entries"
on public.tasting_entries for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own tasting entries" on public.tasting_entries;
create policy "Users can delete their own tasting entries"
on public.tasting_entries for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read their own advice cache" on public.ai_advice_cache;
create policy "Users can read their own advice cache"
on public.ai_advice_cache for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own advice cache" on public.ai_advice_cache;
create policy "Users can insert their own advice cache"
on public.ai_advice_cache for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.wines
    where wines.id = ai_advice_cache.wine_id
      and wines.user_id = auth.uid()
  )
);
