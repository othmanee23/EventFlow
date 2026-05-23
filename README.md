# EventFlow

EventFlow is an internal event coordination platform for the Policy Center for the New South. The app is designed around project workspaces, Kanban task tracking, checklists, comments, and role-based access for the Events department.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Component-based UI architecture
- PostgreSQL with Prisma ORM
- Mock fallback data for local development, with an opt-in strict database mode

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database

Copy `.env.example` to `.env` and set `DATABASE_URL` when a PostgreSQL database is available.

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

If `DATABASE_URL` is not set, the app uses mock data only when `EVENTFLOW_REQUIRE_DATABASE` is not enabled.
Set `EVENTFLOW_REQUIRE_DATABASE=true` in staging/production to disable mock fallback entirely.

## Supabase SSR Setup

If you enable Supabase SSR utilities, define:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

A sample server-rendered Supabase query page is available at `/supabase-todos`.

For staging or production databases, run migrations with:

```bash
npm run prisma:deploy
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for the Vercel staging strategy, environment variables, migration flow, and smoke checks.

## Scripts

```bash
npm run lint
npm run test
npm run typecheck
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
npm run prisma:studio
```

## Workflow

- Feature branches are created from `develop`.
- Pull requests target `develop`.
- Nothing is pushed directly to `main`.
- Each PR should focus on one feature or foundation change.
- CI runs tests, lint, typecheck, and build for pull requests into `develop` and `main`.

## Current Assumptions

- The app can run in mock-fallback mode locally, but staging/production should set `EVENTFLOW_REQUIRE_DATABASE=true`.
- Authentication uses a cookie-backed internal session. Database users authenticate with per-user password hashes, and mock-only local mode still uses `EVENTFLOW_LOGIN_PASSWORD`.
- UI copy is English until the language strategy is confirmed.
- Official PCNS brand assets are not yet available in the repository.
