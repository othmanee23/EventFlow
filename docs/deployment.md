# Deployment

EventFlow uses Vercel for hosted environments and GitHub pull requests for review. Keep deployments aligned with the branch workflow so staging always represents the next reviewed release.

## Branch Strategy

- `develop` is the staging branch.
- `main` is the production branch.
- Feature branches should only create preview deployments for review.
- Pull requests should target `develop`.
- Release work from `develop` to `main` only after the staged version has been reviewed.

Recommended Vercel setup:

| Environment | Vercel project | Production branch |
| --- | --- | --- |
| Staging | `eventflow-staging` | `develop` |
| Production | `eventflow` | `main` |

If there is only one Vercel project for now, use `develop` as the project production branch while the app is still in active staging. Switch the production branch to `main` only when a separate production release flow is ready.

## Environment Variables

Set these variables in Vercel per environment:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/eventflow?schema=public
EVENTFLOW_LOGIN_PASSWORD=your-staging-or-production-password
```

Use a separate PostgreSQL database for staging and production. Do not point staging and production at the same database.

## Database Migrations

Run migrations against the target database before or during a deployment:

```bash
npm run prisma:deploy
```

For local development, use:

```bash
npm run prisma:migrate
npm run prisma:seed
```

Do not run `prisma migrate dev` against staging or production databases.

## Deployment Checks

Before merging a deployment branch:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

After deployment, smoke test:

- `/login`
- `/dashboard`
- `/projects`
- `/users`
- one project board route under `/projects/[projectId]`

## Current Auth Note

Authentication currently uses a cookie-backed internal session with an environment-defined shared password (`EVENTFLOW_LOGIN_PASSWORD`). This is still a temporary internal guard; select a real authentication provider or full credential strategy before production use.
