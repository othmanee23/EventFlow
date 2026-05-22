# EventFlow

EventFlow is an internal event coordination platform for the Policy Center for the New South. The app is designed around project workspaces, Kanban task tracking, checklists, comments, and role-based access for the Events department.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Component-based UI architecture
- PostgreSQL with Prisma ORM
- Mock fallback data until a database is configured and seeded

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

If `DATABASE_URL` is not set, the app continues to use mock data for local development.

For staging or production databases, run migrations with:

```bash
npm run prisma:deploy
```

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

## Current Assumptions

- The app uses mock data until the staging PostgreSQL database is configured and seeded.
- Authentication uses a cookie-backed internal session; password verification remains mocked until the auth approach is confirmed.
- UI copy is English until the language strategy is confirmed.
- Official PCNS brand assets are not yet available in the repository.
