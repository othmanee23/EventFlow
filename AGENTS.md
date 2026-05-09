# EventFlow Agent Guide

## Product Context

EventFlow is an internal event coordination platform for the Policy Center for the New South. It supports event projects, task boards, checklists, comments, and role-based access for Admin, Leader, and Member users.

## Development Workflow

- Use one feature branch per feature.
- Branch from `develop`.
- Open pull requests against `develop`.
- Do not push directly to `main`.
- Keep pull requests focused and easy to review.
- Do not mix unrelated product features in one branch.

## Architecture

- App routes live in `app/`.
- Reusable primitives live in `components/ui/`.
- Layout components live in `components/layout/`.
- Domain UI lives under `components/<domain>/`.
- Domain service and type entry points live under `features/<domain>/`.
- Shared constants, permissions, utilities, and mock data live in `lib/`.
- Shared TypeScript models live in `types/`.

## Implementation Rules

- Keep components small and typed.
- Prefer clear service boundaries over direct mock-data imports in pages.
- Add loading, empty, and error states when a feature has asynchronous behavior.
- Centralize role and permission checks in `lib/permissions.ts`.
- Avoid introducing backend persistence until the backend strategy is approved.
- Do not add attachments, notifications, or advanced features without an explicit request.

## Visual Direction

- Use a modern, minimal, work-focused interface.
- Use dark blue, light blue, white, and neutral grays as the core palette.
- Prioritize dense but readable operational screens over marketing-style layouts.
- Support desktop and tablet layouts at minimum.

