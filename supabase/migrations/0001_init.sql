-- Vagabond initial schema. Mirrors src/lib/types.ts.
-- Apply with the Supabase CLI (`supabase db push`) once a free project exists.

create extension if not exists postgis;

create type member_role as enum ('owner', 'editor', 'viewer');
create type trip_visibility as enum ('private', 'members', 'public');
create type stop_kind as enum ('place', 'food', 'excursion', 'flight', 'lodging', 'transit');
create type booking_status as enum ('not_needed', 'to_book', 'booked');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique not null,
  name text not null,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles on delete cascade,
  title text not null,
  destination text not null,
  cover_emoji text,
  start_date date,
  end_date date,
  visibility trip_visibility not null default 'private',
  published_at timestamptz,
  -- Fork lineage: who this trip was copied from.
  forked_from_id uuid references trips on delete set null,
  created_at timestamptz not null default now()
);
create index on trips (forked_from_id);
create index on trips (visibility, published_at desc);

create table trip_members (
  trip_id uuid references trips on delete cascade,
  user_id uuid references profiles on delete cascade,
  role member_role not null default 'editor',
  primary key (trip_id, user_id)
);

create table days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips on delete cascade,
  position int not null,
  date date,
  title text
);

create table stops (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references days on delete cascade,
  position int not null,
  title text not null,
  kind stop_kind not null default 'place',
  location geography(point, 4326) not null,
  start_time time,
  notes text,
  tags text[] not null default '{}',
  external_place_id text,
  -- Booking, including link-out bookings tracked by hand.
  booking_status booking_status not null default 'not_needed',
  booking_owner_id uuid references profiles on delete set null,
  booking_provider text,
  booking_url text,
  confirmation_code text,
  price_cents int,
  currency text default 'USD',
  paid_by_id uuid references profiles on delete set null
);
create index on stops using gist (location);

-- Personal itinerary variations: a member opting out of a stop.
create table stop_skips (
  stop_id uuid references stops on delete cascade,
  user_id uuid references profiles on delete cascade,
  primary key (stop_id, user_id)
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips on delete cascade,
  day_id uuid references days on delete set null,
  question text not null,
  created_by_id uuid not null references profiles,
  closed boolean not null default false
);

create table vote_options (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid not null references votes on delete cascade,
  label text not null
);

create table vote_ballots (
  vote_id uuid references votes on delete cascade,
  user_id uuid references profiles on delete cascade,
  option_id uuid not null references vote_options on delete cascade,
  primary key (vote_id, user_id)
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips on delete cascade,
  stop_id uuid references stops on delete set null,
  description text not null,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'USD',
  paid_by_id uuid not null references profiles
);

create table expense_shares (
  expense_id uuid references expenses on delete cascade,
  user_id uuid references profiles on delete cascade,
  primary key (expense_id, user_id)
);

-- Row-level security: members see their trips, everyone sees public trips.
create or replace function is_trip_member(t uuid) returns boolean
language sql security definer stable as $$
  select exists (select 1 from trip_members where trip_id = t and user_id = auth.uid())
$$;

alter table trips enable row level security;
create policy "read own or public trips" on trips for select
  using (visibility = 'public' or is_trip_member(id));
create policy "members edit trips" on trips for update using (is_trip_member(id));
create policy "authors create trips" on trips for insert with check (author_id = auth.uid());

alter table trip_members enable row level security;
create policy "members read membership" on trip_members for select using (is_trip_member(trip_id));

-- TODO: policies for days, stops, votes, expenses follow the same pattern
-- (member read/write; public read for days and stops of public trips).
