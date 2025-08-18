# Football Matches App — Database Documentation

This document explains the full database design (Postgres/Supabase): tables, relationships, enums, views, functions, triggers, RLS policies, indexes, and usage patterns. It’s written to serve as **project context** for Cursor/AI tools.

---

## High-Level Concept

* **Admins** (authenticated) create and manage matches.
* **Players** are lightweight profiles (no auth link) used to display names/avatars and to reference who rented the pitch.
* **Signups** link players to a specific match (team + position + name snapshot).
* **Privacy:** matches can be public or private; private ones can be hidden in UI.
* **Ephemeral data:** matches (and related signups) are deleted automatically after they end (recommended via cron job). Players may persist, or be cleaned if desired.

---

## Enums

### `match_type`

Purpose: classify matches.

Values:

* `friendly`
* `training`
* `tournament`

### `soccer_pos`

Purpose: normalize player positions for lineups.

Values (standard notation):

* `gk` — goalkeeper
* `lb` — left back
* `cb` — center back
* `rb` — right back
* `cm` — central midfielder
* `st1` — striker 1
* `st2` — striker 2

---

## Tables

### 1) `admins`

Who can create/update/delete matches.

| Column       | Type          | Notes                                                               |
| ------------ | ------------- | ------------------------------------------------------------------- |
| `user_id`    | `uuid` (PK)   | **FK → `auth.users.id`**. Admin identity is tied to Supabase Auth.  |
| `role`       | `text`        | `'admin' \| 'owner'` (CHECK). Reserved for future role granularity. |
| `created_at` | `timestamptz` | Default `now()`.                                                    |

**Relationships**

* 1:1 with `auth.users`. Only authenticated users present here are admins.

**RLS**

* `SELECT`: `(auth.uid() = user_id)` (optional; used so admins can self-check).
* Inserts are managed outside RLS (service role) when promoting a user to admin.

---

### 2) `players`

Lightweight player profiles (no auth link). One row per human you might show in lists/avatars.

| Column               | Type          | Notes                                                                                        |
| -------------------- | ------------- | -------------------------------------------------------------------------------------------- |
| `id`                 | `uuid` (PK)   | Internal identifier.                                                                         |
| `display_name`       | `text`        | Required; **unique index recommended** (`uq_players_display_name`) to allow upserts by name. |
| `image_url`          | `text`        | Optional avatar URL (Supabase Storage or any CDN).                                           |
| `preferred_position` | `soccer_pos`  | Optional, used as default preference.                                                        |
| `created_at`         | `timestamptz` | Default `now()`.                                                                             |

**Relationships**

* Referenced by `matches.rented_by_player_id`.
* Referenced by `signups.player_id`.

**RLS**

* Open MVP: `SELECT` allowed to all; `INSERT`/`UPDATE` allowed to all (no auth).

  * You can later tighten to self-only via auth or add edit codes.

---

### 3) `matches`

The core event object.

| Column                | Type            | Notes                                                                                                                                  |
| --------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | `uuid` (PK)     | Match identifier.                                                                                                                      |
| `starts_at`           | `timestamptz`   | Start time.                                                                                                                            |
| `ends_at`             | `timestamptz`   | End time.                                                                                                                              |
| `location`            | `text`          | Court/field address or label.                                                                                                          |
| `capacity`            | `int`           | Default `16`.                                                                                                                          |
| `is_private`          | `boolean`       | Default `false`. For private matches you can hide sensitive fields in the UI.                                                          |
| `match_type`          | `match_type`    | Default `'friendly'`.                                                                                                                  |
| `created_by`          | `uuid`          | **FK → `auth.users.id`** (admin who created the match).                                                                                |
| `created_by_label`    | `text`          | Optional, auto-filled from `auth.users.raw_user_meta_data->>'name'`.                                                                   |
| `rented_by_player_id` | `uuid`          | **FK → `players.id`**. Who rented the pitch (preferred normalized link).                                                               |
| `rented_by_name`      | `text`          | Redundant “display name” of the renter, **auto-filled** if `rented_by_player_id` present; or set manually when renter is not a player. |
| `total_cost`          | `numeric(10,2)` | Optional total cost to split among attendees.                                                                                          |
| `created_at`          | `timestamptz`   | Default `now()`.                                                                                                                       |

**Constraints**

* **Presence check:** at least one renter identifier must be present:

  * `rented_by_player_id IS NOT NULL OR rented_by_name IS NOT NULL`

**Triggers**

* `fill_rented_by_name`: before `INSERT/UPDATE` of renter fields, if `rented_by_name` is `NULL` and `rented_by_player_id` is provided, copy the `players.display_name` to `rented_by_name`.
* `set_created_by_label`: before `INSERT`, if `created_by_label` is `NULL`, fill from `auth.users` metadata (optional nicety for UI).

**Relationships**

* `created_by` → `auth.users.id` (admins only can write).
* `rented_by_player_id` → `players.id`.

**RLS**

* `SELECT`: allowed to all (you can create a filtered view if you want to hide location/times for non-insiders in private matches).
* `INSERT/UPDATE/DELETE`: **only admins** (i.e., `exists(select 1 from admins where admins.user_id = auth.uid())`).

**Indexes**

* `(starts_at)` for upcoming queries.

---

### 4) `signups`

Who is attending a match, on which team and which position. Stores a **snapshot** of the player name at signup time.

| Column                  | Type          | Notes                                                                      |
| ----------------------- | ------------- | -------------------------------------------------------------------------- |
| `match_id`              | `uuid`        | **FK → `matches.id`**, `ON DELETE CASCADE`.                                |
| `player_id`             | `uuid`        | **FK → `players.id`**, `ON DELETE CASCADE`.                                |
| `team`                  | `text`        | `'white' \| 'black'` (CHECK).                                              |
| `position`              | `soccer_pos`  | Position chosen **for this match** (can differ from `preferred_position`). |
| `display_name_snapshot` | `text`        | Copied from `players.display_name` by trigger if not provided.             |
| `created_at`            | `timestamptz` | Default `now()`.                                                           |

**Primary Key**

* `(match_id, player_id)` so a player can be registered at most once per match.

**Trigger**

* `fill_signup_snapshot`: before `INSERT`, fill `display_name_snapshot` from `players` when `NULL`.

**RLS**

* Open MVP: `SELECT`, `INSERT`, `UPDATE`, `DELETE` allowed to all (no auth).

  * Later you can enforce self-edit/delete (requires tying signups to user identity or edit codes).

**Indexes**

* `(match_id)`, `(player_id)`, `(match_id, team, position)` for lineup queries.

---

## Views

### `team_lineup`

Provides a ready-to-render lineup for a given match + team, with consistent ordering.

**Columns**

* `match_id`
* `team`
* `player_id`
* `display_name` (from `display_name_snapshot`)
* `image_url` (from `players`)
* `position` (`soccer_pos`)
* `position_order` (int: `gk=1`, `lb=2`, `cb=3`, `rb=4`, `cm=5`, `st1=6`, `st2=7`)
* `position_label` (human label for UI: “Portero”, “Lateral Izquierdo”, etc.)
* `created_at` (signup timestamp)

**Ordering**

* Always sort by `position_order, display_name` for consistent display.

**RLS**

* Inherits RLS from base tables (`players`, `signups`). With current open policies, everyone can `SELECT` from this view.

---

## RPC Functions

### `get_team_lineup(_match_id uuid, _team text)`

Thin RPC wrapper returning the aligned, ordered lineup for a match/team.

**Returns**

* `match_id, team, player_id, display_name, image_url, pos (soccer_pos), position_order, position_label`

> Note: Use `pos` instead of `position` in the return type to avoid the reserved keyword.

**Usage**

```sql
select * from get_team_lineup('<MATCH_UUID>', 'white');
```

### `create_match_with_renter(...) → uuid`

Creates (or reuses) a `player` **within the same call** and inserts a new `match`:

**Parameters**

* `_starts_at timestamptz`
* `_ends_at timestamptz`
* `_location text`
* `_capacity int`
* `_is_private boolean`
* `_match_type match_type`
* `_total_cost numeric(10,2)`
* `_renter_player_id uuid` (nullable)
* `_renter_name text` (nullable)

**Behavior**

* If `_renter_player_id` is provided → use it and copy display name.
* Else if `_renter_name` is provided → upsert `players` by `display_name` and use that id.
* Fills `created_by = auth.uid()` (RLS requires caller to be an admin).
* Returns the new `match.id`.

**Usage**

```sql
-- Known player id:
select create_match_with_renter('2025-08-19 20:30+02','2025-08-19 22:00+02',
  'Court A', 16, false, 'friendly', 64.00,
  'UUID-PLAYER', null);

-- Only renter name:
select create_match_with_renter('2025-08-19 20:30+02','2025-08-19 22:00+02',
  'Court A', 16, false, 'friendly', 64.00,
  null, 'Luis G.');
```

---

## Optional View: `match_payments`

Quick calculation of who gets paid and how much each attendee owes.

**Columns**

* `match_id`
* `pay_to` (renter name)
* `players_count`
* `total_cost`
* `share_per_player` (`total_cost / players_count`, rounded to 2 decimals; `NULL` if `total_cost` is `NULL`)

**Example detail per player**
Join `match_payments` with `signups` to render list of names + per-head amount.

---

## RLS Summary (current MVP)

* **`matches`**:

  * `SELECT`: anyone
  * `INSERT/UPDATE/DELETE`: **admins only** (validated via `auth.uid()` ∈ `admins.user_id`)

* **`players`**:

  * `SELECT`: anyone
  * `INSERT/UPDATE`: anyone (no auth)

* **`signups`**:

  * `SELECT`: anyone
  * `INSERT/UPDATE/DELETE`: anyone (no auth)

> Later hardening options:
>
> * Require auth for `players`/`signups` writes.
> * Add `edit_code` columns to allow non-authenticated “self” edits.
> * Add RLS conditions based on `request.headers` if you want lightweight validation.

---

## Data Lifecycle

* **Creation**: admins create matches (direct `INSERT` or via `create_match_with_renter()`).
* **Signup**: any user can create/update/delete signups and create/update player profiles.
* **Privacy**: private matches are marked with `is_private`. You can selectively hide fields in the UI or use a dedicated view.
* **Cleanup**: run a scheduled job every X minutes:

  ```sql
  delete from matches
  where ends_at < now() - interval '1 hour';
  ```

  Thanks to `ON DELETE CASCADE`, related `signups` are removed automatically.
  Optional: remove orphan `players` (those not referenced in any active match) if you want fully ephemeral data.

---

## Indexes

Recommended performance indexes:

* `matches(starts_at)` — upcoming queries.
* `signups(match_id)` — per-match rosters.
* `signups(player_id)` — per-player history (if you keep players).
* `signups(match_id, team, position)` — lineup view queries.
* `players(display_name)` — **unique** for upsert-by-name behavior.

---

## Example Queries

**Upcoming public matches**

```sql
select *
from matches
where starts_at >= now()
order by starts_at asc
limit 20;
```

**Match roster (both teams)**

```sql
select team, display_name_snapshot, position
from signups
where match_id = '<MATCH_UUID>'
order by team, created_at;
```

**Team lineup (ordered)**

```sql
select * from get_team_lineup('<MATCH_UUID>', 'white');
```

**Who to pay and how much**

```sql
select * from match_payments where match_id = '<MATCH_UUID>';
```

---

## Notes & Future Extensions

* **Payments**: If you need per-player `paid` state or payment methods, add a table `payments` or a boolean `paid` to `signups`.
* **Private match reveal**: Consider a view that returns `NULL` for `location`/`starts_at` unless the viewer is an admin or is signed up.
* **Auth for players**: When ready, reintroduce `players.user_id` FK to `auth.users.id` and tighten RLS.
* **Rate limiting**: For open writes, guard via API layer (Edge Functions) or add request-based checks (e.g., captcha, ip throttling).

---

This schema is intentionally **simple, safe, and extensible**: it works for a zero-friction MVP and can be locked down easily when you add authentication for general users.
