# Development Conventions

## General

- Use TypeScript strict mode.
- Prefer Server Components by default.
- Add `"use client"` only for browser-only interactivity.
- Keep feature code inside `src/features/<feature>/` when business modules are
  introduced.
- Keep integration clients under `src/lib/<integration>/`.

## Routing

- Public pages go in `(marketing)`.
- Auth pages go in `(auth)`.
- Protected workspace pages go in `(dashboard)`.
- HTTP APIs go in `src/app/api/**/route.ts`.
- Route strings must come from `src/config/routes.ts`.

## UI

- Use shadcn/ui primitives in `src/components/ui/`.
- Use Tailwind tokens from `globals.css` and `tailwind.config.ts`.
- Construction theme defaults to navy blue, orange accents, concrete surfaces,
  and corporate spacing.
- Keep cards for repeated records, dashboard panels, and modals.
- Do not nest cards inside cards.

## Server Actions

- Server Actions validate input with Zod.
- Wrap mutations with `runServerAction`.
- Return `ActionResult<T>` instead of throwing directly into client components.
- Revalidate affected paths only after successful mutation.

## Route Handlers

- Use `withRouteHandler` for error handling.
- Use `okResponse` for successful JSON responses.
- Keep API response envelopes consistent.
- Route Handlers that touch Prisma, Cloudinary, or Resend must run on Node.js.

## Database

- Use Prisma migrations for schema changes.
- Keep tenant-scoped business data tied to `organizationId`.
- Add indexes before introducing list views or reports.
- Do not query Prisma from Client Components.
- Do not import Prisma into middleware if middleware is introduced later.

## Authentication

- Use `auth()` in Server Components, Server Actions, and Route Handlers.
- Enforce workspace protection in server layouts.
- Add middleware only when the selected auth provider path is Edge-safe.
- Check organization membership for business operations.
- Add providers in `src/lib/auth/config.ts` only after provider choice is made.

## Errors and Logs

- Throw `AppError` for expected failures.
- Let unexpected failures bubble into wrappers.
- Use `logger.info`, `logger.warn`, and `logger.error` with structured context.
- Never log raw credentials or provider tokens.

## Naming

- Components: `PascalCase`.
- Server utilities: descriptive verbs, for example `sendEmail`.
- Prisma models: singular nouns.
- Route folders: lowercase URL segments.
- Feature folders: kebab-case.
