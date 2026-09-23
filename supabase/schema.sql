-- Movin' database schema + Row Level Security
-- Run this in the Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trips
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  country text not null,
  start_date date not null,
  end_date date not null,
  budget numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  travelers integer not null default 1,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips(user_id);

alter table public.trips enable row level security;

create policy "Users manage own trips"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Itinerary items
create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time text,
  title text not null,
  category text not null default 'Other',
  location text,
  estimated_cost numeric(12, 2) default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists itinerary_trip_id_idx on public.itinerary_items(trip_id);

alter table public.itinerary_items enable row level security;

create policy "Users manage own itinerary"
  on public.itinerary_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Saved places
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  location text,
  rating numeric(3, 1),
  estimated_price numeric(12, 2),
  image_url text,
  notes text,
  external_id text,
  created_at timestamptz not null default now()
);

create index if not exists saved_places_trip_id_idx on public.saved_places(trip_id);

alter table public.saved_places enable row level security;

create policy "Users manage own saved places"
  on public.saved_places for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  category text not null,
  amount numeric(12, 2) not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_trip_id_idx on public.expenses(trip_id);

alter table public.expenses enable row level security;

create policy "Users manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
