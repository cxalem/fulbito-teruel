# Fulbito Teruel ⚽

Football matches management app built with Next.js, Supabase, React Query, and shadcn/ui.

**Language**: All user-facing text is in Spanish. Code and technical documentation remain in English.

## Quick Start

1. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAILS` (comma-separated list of admin emails)

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```

4. **Set up database and authentication**
   - Run the SQL commands from `prompt.md` in your Supabase SQL editor
   - Follow the [Google OAuth Setup Guide](docs/google-oauth-setup.md) to configure authentication

## Features

- ✅ **Step 1 Complete**: Project setup with Next.js, TypeScript, Tailwind, shadcn/ui
- ✅ **Step 2 Complete**: Google OAuth authentication with admin auto-enrollment
- ✅ **Step 3 Complete**: React Query hooks & Server Actions with full CRUD operations
- ✅ **Step 4 Complete**: Beautiful upcoming matches list with React Query integration
- ✅ **Step 5 Complete**: Admin-only match creation form with comprehensive validation
- ✅ **Step 6 Complete**: Match detail page with team lineups and player signups
- ✅ **Authentication**: Google OAuth with admin auto-enrollment
- ✅ **Authorization**: RLS policies enforcing admin-only match creation
- ✅ **Data Layer**: Comprehensive server actions for matches, players, and signups
- ✅ **React Query Integration**: Smart caching, mutations, and real-time updates
- ✅ **Matches UI**: Beautiful match cards with loading states and empty states
- ✅ **Match Creation**: Professional form with date/time pickers and validation
- ✅ **Match Details**: Comprehensive match info with privacy handling
- ✅ **Team Lineups**: Visual team organization with positions and player management
- ✅ **Player Signups**: Streamlined popup signup with team pre-selection
- ✅ **Smart User Detection**: Auto-fills name/avatar for logged-in users
- ✅ **Player Management**: Create new players or select from existing ones
- ✅ **Admin Panel**: Enhanced test interface with React Query hooks
- ✅ **Theming**: Light/dark mode with zinc/slate palette
- ✅ **Spanish UI**: All user-facing text in Spanish
- 🚧 **Coming next**: Edge Functions for cleanup, final polish

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth (Google OAuth)
- **Package Manager**: pnpm

## Project Structure

```
app/
  ├── auth/callback/         # OAuth callback handler
  ├── layout.tsx            # Root layout with providers
  └── page.tsx              # Home page

components/
  ├── providers/            # React Query + Theme providers
  ├── ui/                   # shadcn/ui components
  ├── auth-button.tsx       # Authentication button
  ├── navbar.tsx            # Main navigation
  └── theme-toggle.tsx      # Light/dark mode toggle

lib/
  ├── supabase/            # Supabase client utilities
  └── utils.ts             # Utility functions
```

## Data Layer (Step 3)

### Server Actions
- **Matches**: `lib/actions/matches.ts` - CRUD operations with RLS enforcement
- **Players**: `lib/actions/players.ts` - Player management with upsert by name
- **Signups**: `lib/actions/signups.ts` - Team lineup management with RPC functions

### React Query Hooks
- **Match Hooks**: `useUpcomingMatches()`, `useMatch()`, `useCreateMatch()`, `useUpdateMatch()`, `useDeleteMatch()`
- **Player Hooks**: `usePlayers()`, `usePlayer()`, `useSearchPlayers()`, `useCreateOrUpdatePlayer()`
- **Signup Hooks**: `useTeamLineup()`, `useMatchLineups()`, `useCreateSignup()`, `useUpdateSignup()`, `useDeleteSignup()`

### Key Features
- **Smart Caching**: 5-minute stale time for matches, 10-minute for players
- **Optimistic Updates**: Instant UI feedback with automatic rollback on error
- **Cache Invalidation**: Strategic cache updates on mutations
- **Error Handling**: Spanish error messages with toast notifications
- **Loading States**: Proper loading indicators for all operations

## Next Steps

Follow the build plan in `prompt.md` to implement:
- Step 4: Upcoming matches list with React Query
- Step 5: Match creation form (admin-only)
- Step 6: Player management UI
- Step 7: Match detail page + signups
- Step 8: Cleanup job
- Step 9: Polish & theming