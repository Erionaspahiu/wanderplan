# WanderPlan — Smart Trip Planner

A portfolio-ready full-stack travel planning app. Create trips, build daily itineraries, discover places, and track your budget — all in one clean dashboard.

## How it works

```text
Browser (React app)
   │
   ├─ AuthContext → login / register / session
   │
   └─ Services (trip, itinerary, expense, places)
         │
         ├─ Demo mode (no .env keys) → localStorage on this device
         └─ Production mode (.env keys set) → Supabase Auth + PostgreSQL
```

1. **Landing page** — public marketing site; anyone can view it.
2. **Sign up / Sign in** — creates a user session (local or Supabase).
3. **Dashboard** — shows only *your* trips and stats.
4. **Create trip** — saves destination, dates, budget, travelers.
5. **Trip dashboard** — Overview, Itinerary, Places, Budget tabs.
6. **Services layer** — components never talk to the database directly; they call `src/services/*`.

**Data privacy:** With Supabase, Row Level Security ensures each user can only read/write their own rows. In demo mode, data stays in that browser’s `localStorage`.

## Can other people use it?

| Situation | Can others use it? | Shared data? |
|-----------|--------------------|--------------|
| You run `npm run dev` on your PC | Only people on your machine (or your local network if you expose it) | No — each browser has its own demo data |
| Someone clones the repo and runs it | Yes — they run their own copy | No — their data stays on their device |
| You **deploy** the site + connect **Supabase** | Yes — anyone with the URL can register | Yes online, but each account only sees their own trips |

**Short answer:**  
- For a **portfolio demo on your laptop**, demo mode is enough.  
- For a **real shared product** (friends, recruiters, public users), deploy the frontend and add Supabase credentials.

## Features

- Public landing page with destinations and product story
- Email/password authentication (Supabase or local demo mode)
- Protected dashboard with trip stats
- Create trips (destination, dates, budget, travelers, image)
- Trip dashboard with Overview, Itinerary, Places, and Budget tabs
- Daily itinerary CRUD with categories and day grouping
- Expense tracker with category breakdown and progress bar
- Place discovery with mock data (API-ready service layer)
- Responsive UI for desktop, tablet, and mobile
- Loading, empty, error, toast, and confirmation states

## Technologies

- **Frontend:** React, Vite, JavaScript, React Router, Lucide React
- **Backend:** Supabase (Auth + PostgreSQL + Row Level Security)
- **Styling:** Custom CSS design system (no UI kit)

## Screenshots

Add screenshots here after running the app:

1. Landing page hero
2. Dashboard with trip cards
3. Trip itinerary view
4. Budget tracker
5. Places discovery

Suggested filenames: `docs/screenshots/landing.png`, `dashboard.png`, etc.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

**Demo mode:** Leave both empty. The app runs fully with `localStorage`, including a Sicily demo account.

### 3. Run locally

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Demo login (local mode)

| Field | Value |
|-------|-------|
| Email | `demo@wanderplan.app` |
| Password | `demo123` |

This account includes a sample Sicily trip with itinerary, expenses, and saved places.

## Supabase setup (for real multi-user use)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Enable Email auth under **Authentication → Providers**
4. Put your project URL and anon key into `.env` (local) or your host’s env settings (deploy)
5. Restart / redeploy

When credentials are present, the service layer uses Supabase. When empty, it uses demo mode.

## Deploy so anyone can use it

### Option A — Vercel (recommended)

1. Push this project to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

`vercel.json` is already configured for React Router.

### Option B — Netlify

1. Connect the GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the same Supabase env vars
5. `public/_redirects` handles SPA routing

### After deploy

- Share your live URL
- Visitors click **Get Started**, create an account, and plan their own trips
- You do **not** see their private trip data (RLS)

## Database

Tables:

- `profiles` — user profile linked to `auth.users`
- `trips` — trip details and budget
- `itinerary_items` — daily plan items
- `saved_places` — places saved to a trip
- `expenses` — budget entries

All user-owned tables use foreign keys to `auth.users` and **Row Level Security**. See `supabase/schema.sql`.

## Project structure

```text
src/
  components/   # UI, layout, trip, budget, itinerary, places
  context/      # Auth provider
  data/         # Demo / mock catalog
  hooks/
  layouts/
  pages/
  services/     # supabase, trips, itinerary, expenses, places
  styles/       # design tokens + component CSS
  utils/
supabase/
  schema.sql
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Future improvements

- Connect Google Places / Foursquare for live discovery
- Collaborative trip sharing
- PDF / shareable itinerary export
- Map view for places and daily routes
- Currency conversion
- Mobile app (React Native)

## License

MIT — feel free to use this project in your portfolio.
