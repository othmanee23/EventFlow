# EventFlow

EventFlow is an internal event coordination platform for the Policy Center for the New South. The app is designed around project workspaces, Kanban task tracking, checklists, comments, and role-based access for the Events department.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Component-based UI architecture
- Mock data for the first setup branch

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

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
```

## Workflow

- Feature branches are created from `develop`.
- Pull requests target `develop`.
- Nothing is pushed directly to `main`.
- Each PR should focus on one feature or foundation change.

## Current Assumptions

- The first version uses mock data.
- Authentication is mocked until the auth approach is confirmed.
- UI copy is English until the language strategy is confirmed.
- Official PCNS brand assets are not yet available in the repository.

