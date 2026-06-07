# Architecture

## 1. Enterprise Folder Structure

The app uses `src/` and keeps framework, domain, infrastructure, and UI
boundaries separate.

```text
src/app/                  Next.js App Router routes, layouts, errors, API routes
src/app/(marketing)/      Public construction-company shell
src/app/(auth)/           Authentication screens and auth-only layouts
src/app/(dashboard)/      Protected workspace routes
src/app/api/              Route Handlers for HTTP APIs and integrations
src/components/ui/        shadcn/ui primitives
src/components/layout/    Shared page shells and navigation
src/components/providers/ Root React providers
src/config/               App config, route constants, env validation
src/lib/auth/             Auth policy, roles, permission helpers
src/lib/db/               Prisma client singleton
src/lib/email/            Resend integration boundary
src/lib/errors/           Typed application errors and response wrappers
src/lib/storage/          Cloudinary integration boundary
src/server/actions/       Server Action result and validation helpers
src/types/                Type augmentations
prisma/                   Database schema and future migrations
docs/                     Architecture and operational standards
```

Feature modules should later live under `src/features/<feature-name>/` with
their server code, schemas, components, and tests colocated by business area.

## 2. Route Organization

Routes are separated by audience and runtime responsibility.

```text
src/app/(marketing)/page.tsx            Public corporate construction entry
src/app/(auth)/sign-in/page.tsx         Authentication boundary
src/app/(dashboard)/dashboard/page.tsx  Protected operations workspace shell
src/app/api/auth/[...nextauth]/route.ts Auth.js Route Handler
src/app/api/health/route.ts             Health check Route Handler
```

Route constants live in `src/config/routes.ts`. Avoid hard-coded route strings
inside feature code.

## 3. Authentication Architecture

Auth.js is split into two layers:

- `src/lib/auth/config.ts`: Edge-safe shared config, pages, callbacks, and
  route authorization.
- `src/auth.ts`: Node.js server auth with Prisma adapter.

Protected workspace layouts and Route Handlers import `auth()` from
`src/auth.ts`. Middleware is intentionally not enabled in the foundation so
Auth.js/Jose does not create Edge-runtime warnings on Vercel. If middleware is
introduced later, it should import only the Edge-safe config and must not import
Prisma.

Session strategy is JWT for platform compatibility. Prisma still persists users,
accounts, verification tokens, and future membership data.

Role strategy:

- Global role lives on `User.role`.
- Organization-specific role lives on `Membership.role`.
- Permission helpers live in `src/lib/auth/permissions.ts`.
- Feature-level authorization should check membership first, then global role.

## 4. Database Architecture

PostgreSQL is modeled through Prisma for Neon.

Current foundation models:

- Auth.js: `User`, `Account`, `Session`, `VerificationToken`
- Tenant and access: `Organization`, `Membership`
- Construction domain: `Client`, `Project`, `ProjectPhase`
- Infrastructure records: `MediaAsset`, `AuditLog`

Service taxonomy is captured by `ServiceType`:

- `HOUSE_CONSTRUCTION`
- `BUILDING_CONSTRUCTION`
- `CIVIL_CONTRACTING`
- `RENOVATION`

Every business record is scoped by `organizationId` where appropriate. This
keeps the platform ready for multi-branch or multi-company expansion.

## 5. State Management Strategy

Default state ownership:

- Server state: React Server Components, Route Handlers, Server Actions, Prisma.
- Form mutations: Server Actions wrapped with `runServerAction`.
- URL state: filters, tabs, pagination, and deep-linkable dashboard views.
- Client UI state: local React state for menus, drawers, dialogs, and transient
  interactions.

Do not introduce a global client store until there is cross-route client state
that cannot be expressed through URL state or server data.

## 6. Environment Variable Setup

Environment validation lives in `src/config/env.ts`.

Required before production:

```text
NEXT_PUBLIC_APP_URL
DATABASE_URL
DIRECT_URL
AUTH_SECRET
AUTH_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
EMAIL_FROM
LOG_LEVEL
```

Local setup starts from `.env.example`. Use `npx auth secret` to generate the
Auth.js secret.

## 7. Deployment Strategy

Hosting target is Vercel.

Recommended deployment flow:

1. Create Neon PostgreSQL database.
2. Add Vercel environment variables from `.env.example`.
3. Run Prisma migrations from CI or a controlled release step:
   `npm run db:deploy`.
4. Vercel build command: `npm run build`.
5. Confirm `/api/health` after deployment.

Cloudinary stores project media. Resend sends transactional email.

## 8. Error Handling Architecture

Application errors use `AppError` from `src/lib/errors/app-error.ts`.

Route Handlers use:

```ts
withRouteHandler(async () => okResponse(data));
```

Server Actions use:

```ts
runServerAction(schema, input, async (parsed) => result);
```

The public response shape is consistent:

```ts
{ error: { code: string, message: string } }
```

Internal errors are logged with full context but return a generic public
message.

## 9. Logging Architecture

Server logs use `pino` through `src/lib/logger.ts`.

Logging rules:

- Log structured objects, not string-only messages.
- Include `organizationId`, `projectId`, `userId`, and request identifiers when
  available.
- Never log secrets, tokens, passwords, or signed upload credentials.
- Route Handler and Server Action wrappers log failures centrally.
- Vercel captures stdout/stderr, so JSON logs can be searched and exported.
