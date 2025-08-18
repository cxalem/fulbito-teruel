You are a senior **Next.js + Supabase** engineer. Build a small, production-ready web app **step by step, feature by feature**, using the exact stack and constraints below. At each step, output: a brief plan, full file diffs (create/modify), and instructions to run/test. Keep code clean, typed, and minimal.

## Tech + Constraints

* **Framework:** Next.js (latest, App Router, TypeScript, Server Actions enabled).
* **UI:** Tailwind CSS + **shadcn/ui** components. Every clickable (Button, Link, CardAction, IconButton, ListItem) must include `cursor-pointer`.
* **Themes:** Light/Dark via `next-themes`. **Do not use pure white/black**; use zinc/slate palette (e.g., `bg-zinc-50` / `dark:bg-zinc-950`, `text-zinc-900` / `dark:text-zinc-100`).
* **Auth:** Supabase Auth with **Google login only** (admins must authenticate). **Players do not require auth**.
* **DB:** Supabase Postgres with RLS (policies below). Use the **exact SQL** provided.
* **Data Fetching:** React Query (TanStack Query) for client-side data fetching, caching, and state management.
* **Storage:** Supabase Storage bucket `avatars` (public for MVP) for player images.
* **Simplicity:** Mobile-first, responsive, accessible.
* **Language:** All user-facing text must be in Spanish. Code, variable names, and technical documentation remain in English.
* **Security:** RLS must enforce "only admins can write matches". All else open for MVP. No secrets on the client beyond anon key.

## ENV

Create `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...           # only used in Edge Function cron cleanup
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=alejandro@example.com,another@example.com  # used to auto-enroll admins on first login
```

## Install

* Initialize Next.js (latest, TS) with pnpm.
* Add Tailwind, shadcn/ui, next-themes.
* Install with pnpm: `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query`, `lucide-react`, `react-hook-form`, `zod` (for simple validation), `date-fns`, `clsx`.

## Database — Run in Supabase SQL editor (in order)

```sql
-- Enums
do $$ begin
  perform 1 from pg_type where typname = 'match_type';
  if not found then create type match_type as enum ('friendly','training','tournament'); end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'soccer_pos';
  if not found then create type soccer_pos as enum ('gk','lb','cb','rb','cm','st1','st2'); end if;
end $$;

-- Tables
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','owner')),
  created_at timestamptz default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  image_url text,
  preferred_position soccer_pos,
  created_at timestamptz default now()
);
create unique index if not exists uq_players_display_name on players(display_name);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  capacity int not null default 16,
  is_private boolean not null default false,
  match_type match_type not null default 'friendly',
  created_by uuid not null references auth.users(id),
  created_by_label text,
  rented_by_player_id uuid references players(id),
  rented_by_name text,
  total_cost numeric(10,2),
  created_at timestamptz default now(),
  constraint matches_renter_presence_chk check (rented_by_player_id is not null or rented_by_name is not null)
);

create table if not exists signups (
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  team text not null check (team in ('white','black')),
  position soccer_pos,
  display_name_snapshot text not null,
  created_at timestamptz default now(),
  primary key (match_id, player_id)
);

-- Triggers
create or replace function fill_signup_snapshot()
returns trigger language plpgsql as $$
begin
  if new.display_name_snapshot is null or length(trim(new.display_name_snapshot)) = 0 then
    select p.display_name into new.display_name_snapshot from players p where p.id = new.player_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_fill_signup_snapshot on signups;
create trigger trg_fill_signup_snapshot
before insert on signups
for each row execute function fill_signup_snapshot();

create or replace function set_created_by_label()
returns trigger language plpgsql as $$
begin
  if new.created_by_label is null then
    select coalesce(u.raw_user_meta_data->>'name', 'admin') into new.created_by_label
    from auth.users u where u.id = new.created_by;
  end if;
  return new;
end $$;

drop trigger if exists trg_set_created_by_label on matches;
create trigger trg_set_created_by_label
before insert on matches
for each row execute function set_created_by_label();

create or replace function fill_rented_by_name()
returns trigger language plpgsql as $$
begin
  if new.rented_by_name is null and new.rented_by_player_id is not null then
    select p.display_name into new.rented_by_name from players p where p.id = new.rented_by_player_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_fill_rented_by_name on matches;
create trigger trg_fill_rented_by_name
before insert or update of rented_by_player_id, rented_by_name on matches
for each row execute function fill_rented_by_name();

-- View + RPC
create or replace view team_lineup as
select
  s.match_id,
  s.team,
  s.player_id,
  s.display_name_snapshot as display_name,
  p.image_url,
  s.position,
  case s.position
    when 'gk' then 1 when 'lb' then 2 when 'cb' then 3
    when 'rb' then 4 when 'cm' then 5 when 'st1' then 6 when 'st2' then 7
    else 99 end as position_order,
  case s.position
    when 'gk' then 'Portero' when 'lb' then 'Lateral Izquierdo' when 'cb' then 'Defensa Central'
    when 'rb' then 'Lateral Derecho' when 'cm' then 'Medio Campo'
    when 'st1' then 'Delantero 1' when 'st2' then 'Delantero 2' end as position_label,
  s.created_at
from signups s
join players p on p.id = s.player_id;

create or replace function get_team_lineup(_match_id uuid, _team text)
returns table (
  match_id uuid, team text, player_id uuid, display_name text,
  image_url text, pos soccer_pos, position_order int, position_label text
) language sql stable as $$
  select tl.match_id, tl.team, tl.player_id, tl.display_name, tl.image_url,
         tl.position as pos, tl.position_order, tl.position_label
  from team_lineup tl
  where tl.match_id = _match_id and tl.team = _team
  order by tl.position_order, tl.display_name;
$$;

-- Helper to create match + renter in one go
create or replace function create_match_with_renter(
  _starts_at timestamptz, _ends_at timestamptz, _location text, _capacity int,
  _is_private boolean, _match_type match_type, _total_cost numeric(10,2),
  _renter_player_id uuid default null, _renter_name text default null
) returns uuid language plpgsql as $$
declare renter_id uuid; name_for_renter text; new_match_id uuid;
begin
  if _renter_player_id is not null then
    renter_id := _renter_player_id; select display_name into name_for_renter from players where id = renter_id;
  elsif _renter_name is not null then
    insert into players (display_name) values (_renter_name)
    on conflict (display_name) do update set display_name = excluded.display_name
    returning id into renter_id;
    name_for_renter := _renter_name;
  else
    raise exception 'Provide _renter_player_id or _renter_name';
  end if;

  insert into matches (id, starts_at, ends_at, location, capacity, is_private, match_type,
                       created_by, rented_by_player_id, rented_by_name, total_cost)
  values (gen_random_uuid(), _starts_at, _ends_at, _location, coalesce(_capacity,16),
          coalesce(_is_private,false), coalesce(_match_type,'friendly'::match_type),
          auth.uid(), renter_id, name_for_renter, _total_cost)
  returning id into new_match_id;

  return new_match_id;
end; $$;

-- Indexes
create index if not exists idx_matches_starts_at on matches (starts_at);
create index if not exists idx_signups_match on signups (match_id);
create index if not exists idx_signups_player on signups (player_id);
create index if not exists idx_signups_match_team_pos on signups (match_id, team, position);

-- RLS
alter table admins  enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table signups enable row level security;

drop policy if exists p_admins_self_read on admins;
create policy p_admins_self_read on admins for select using (auth.uid() = user_id);

drop policy if exists p_matches_read_all on matches;
create policy p_matches_read_all on matches for select using (true);

drop policy if exists p_matches_insert_admin on matches;
create policy p_matches_insert_admin on matches for insert
with check (exists(select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists p_matches_update_admin on matches;
create policy p_matches_update_admin on matches for update
using (exists(select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists p_matches_delete_admin on matches;
create policy p_matches_delete_admin on matches for delete
using (exists(select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists p_players_read_all on players;
create policy p_players_read_all on players for select using (true);
drop policy if exists p_players_insert_any on players;
create policy p_players_insert_any on players for insert with check (true);
drop policy if exists p_players_update_any on players;
create policy p_players_update_any on players for update using (true);

drop policy if exists p_signups_read_all on signups;
create policy p_signups_read_all on signups for select using (true);
drop policy if exists p_signups_insert_any on signups;
create policy p_signups_insert_any on signups for insert with check (true);
drop policy if exists p_signups_update_any on signups;
create policy p_signups_update_any on signups for update using (true);
drop policy if exists p_signups_delete_any on signups;
create policy p_signups_delete_any on signups for delete using (true);
```

## Build Plan — Implement incrementally

### Step 1 — Project Setup

* Initialize Next.js (App Router, TS), Tailwind, shadcn/ui, next-themes.
* Configure Tailwind with **zinc/slate** palette; avoid `#fff`/`#000`.
* Add global layout with `ThemeProvider` + `QueryClientProvider` + top navbar (brand, **ThemeToggle**, **Login with Google / Logout**).
* Add `lib/supabase/client.ts` and `lib/supabase/server.ts` using `@supabase/ssr` (`createBrowserClient`, `createServerClient`).
* Set up React Query with `QueryClientProvider` and devtools.
* Add `Providers` to wrap the app.
* **Acceptance:** app boots, theme toggles, Google login opens, React Query devtools available.

### Step 2 — Auth (Google-only) + Admin auto-enroll

* Add a **Login** button: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `\${NEXT\_PUBLIC\_APP\_URL}/auth/callback` }})`.
* Handle `/auth/callback` route (server) to set cookies/session.
* On first login, **auto-insert** into `admins` if email ∈ `ADMIN_EMAILS` and not present.
* Show “Admin” badge if current user exists in `admins`.
* **Acceptance:** admin user appears in `admins`; non-admin cannot write to `matches`.

### Step 3 — React Query Hooks & Server Actions

* Create React Query hooks in `lib/queries/`:

  * `useUpcomingMatches()` - cached match list with 5min stale time
  * `useMatch(id)` - individual match details
  * `useTeamLineup(id, team)` - team roster with 2min stale time
  * `useCreateMatch()` - mutation for match creation
  * `useCreateSignup()` - mutation with cache invalidation
  * `useUpdateSignup()` - edit team/position
  * `useDeleteSignup()` - remove signup

* Create corresponding Server Actions in `lib/actions/`:

  * `createMatchWithRenter(form)` → calls RPC `create_match_with_renter`
  * `createOrUpdatePlayer(form)`
  * `upsertSignup(matchId, playerId, team, position)`
  * `deleteSignup(matchId, playerId)`

### Step 4 — Home: Upcoming Matches List

* `/` page: use `useUpcomingMatches()` hook to list next 20 matches with loading skeleton.
* Show cards with date/time, location, type badge, privacy label. If `is_private` true and user is not admin, still show the card but it's visibly "Private".
* The private view should show the match type but not the location nor the time.
* Each card is clickable (`cursor-pointer`) linking to `/matches/[id]`.
* If user is admin, show "Create Match" fab/button.
* **Acceptance:** Matches load with proper caching, skeletons during loading.

### Step 5 — Create Match (Admin-only)

* `/matches/new` page with form using `useCreateMatch()` mutation:

  * Date/time pickers for `starts_at`, `ends_at`
  * `location`, `capacity`, `match_type`, `is_private`
  * **Renter:** select existing Player (combobox) **or** free text name
  * Optional `total_cost`
* On submit: use mutation to call `createMatchWithRenter` Server Action.
* Show loading state during mutation, invalidate matches cache on success.
* Redirect to `/matches/[id]` on success.
* **Acceptance:** Non-admin cannot reach/submit; admin can create successfully with proper loading states.

### Step 6 — Players (No Auth)

* Inline Player creator (dialog or section) with `display_name`, optional `image_url` (file upload to `avatars` bucket, return public URL).
* Prefill `display_name` from `localStorage` for UX.
* **Acceptance:** Can create/update a player without logging in; avatar shows across the app.

### Step 7 — Match Detail + Signups

* `/matches/[id]` page using React Query hooks:

  * Use `useMatch(id)` for match details with loading skeleton
  * Use `useTeamLineup(id, 'white')` and `useTeamLineup(id, 'black')` for both team rosters
  * Show match info, renter ("Pay to"), total cost and per-player share (compute in page or via simple SQL).
  * **Signup form** (no auth): pick **team** (white/black), **position** (enum), select **player** (combobox) or create new inline.
  * Use `useCreateSignup()` mutation for new signups
  * Each signup has **Edit** (use `useUpdateSignup()`) and **Remove** (use `useDeleteSignup()`) actions.
* **Acceptance:** Users can sign up, switch teams/positions, and remove themselves; lineups update instantly via cache invalidation.

### Step 8 — Cleanup Job (Edge Function + Schedule)

* Create a Supabase Edge Function `cleanup_matches` that runs:

  ```sql
  delete from matches where ends_at < now() - interval '1 hour';
  ```

  (signups cascade). Use `SUPABASE_SERVICE_ROLE_KEY`.
* Add `supabase.toml` cron (e.g., every 10 minutes).
* **Acceptance:** Past matches vanish automatically \~1h after they end.

### Step 9 — Polish & Theming

* Ensure all interactive elements have `cursor-pointer`.
* Ensure light/dark tokens use zinc/slate variations (no pure white/black).
* Add empty states, loading skeletons, toasts for actions, and basic error handling.

## UI Components (shadcn)

* Button, Card, Input, Select, Dialog/Sheet, Badge, Toggle/Switch, Avatar, Separator, Toast.
* Wrap color tokens to zinc/slate shades; keep spacing and rounded corners consistent (`rounded-2xl`, soft shadows).

## Deliverables per Step

* Plan + file diffs (full file contents).
* Commands to run.
* Screenshots/gifs (optional) or textual verification.
* Notes on RLS interactions for the step.

## Important Notes

* RLS is authoritative: only admins may write `matches`.
* Players & Signups are open writes for MVP (no auth).
* Always use typed Supabase responses; handle errors and show toasts.
* Keep pages accessible (labels, roles) and responsive (stack on mobile).
* Use Server Actions for mutations where possible; otherwise Route Handlers (`app/api/...`).

**Begin with Step 1 now.**