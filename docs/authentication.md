# Authentication and Authorization

## Auth.js Setup

Auth.js is configured in two layers:

- `src/lib/auth/config.ts`: Edge-safe shared callbacks for middleware and route
  authorization.
- `src/auth.ts`: Node runtime Auth.js instance with Prisma adapter and
  credentials provider.

The credentials provider validates email and password with Zod, loads the user
from Prisma, checks `isActive`, verifies `passwordHash` with bcrypt, and stores
role metadata in the JWT session.

## Roles

Runtime RBAC uses two roles:

- `ADMIN`
- `CUSTOMER`

The Prisma `User.role` field is the source of truth.

## Routes

Protected route groups:

```text
/admin/*
/customer/*
```

Admins can access:

- `/admin/leads`
- `/admin/site-visits`
- `/admin/projects`
- `/admin/payments`
- `/admin/customers`

Customers can access:

- `/customer`
- `/customer/projects/:projectId`
- `/customer/payments`

## Middleware

Middleware lives in `src/middleware.ts` and uses Auth.js:

```ts
export const config = {
  matcher: ["/admin/:path*", "/customer/:path*", "/sign-in"]
};
```

The middleware checks:

- unauthenticated users are sent to `/sign-in`
- non-admins cannot enter `/admin/*`
- non-customers cannot enter `/customer/*`
- signed-in users visiting `/sign-in` are sent to their role home

## Session Handling

JWT sessions include:

```ts
session.user.id
session.user.role
session.user.organizationId
session.user.customerId
```

Server-side guards live in `src/lib/auth/authorization.ts`:

- `requireAuth()`
- `requireAdmin()`
- `requireCustomer()`
- `assertCustomerOwnsProject()`
- `getCustomerProjects()`

## Customer Data Isolation

Customer project access is enforced server-side with:

```ts
await assertCustomerOwnsProject({
  userId: session.user.id,
  projectId
});
```

The check joins through `Project -> Customer -> User`, preventing customers from
loading another customer's project by guessing a URL.

## Seed Credentials

Before login works locally, create `.env.local` from `.env.example`, set
`DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET`, then run:

```bash
npm run db:push
npm run db:seed
```

Generate `AUTH_SECRET` with:

```bash
npx auth secret
```

After seeding:

```text
Admin:
email: admin@apexconstructions.example
password: Admin@12345

Customer:
email: customer@example.com
password: Customer@12345
```

Use these for local development only.

## Security Practices

- Passwords are never stored directly; only bcrypt hashes are persisted.
- Disabled users cannot sign in.
- Session role data comes from the server-side authorization callback.
- Middleware protects route groups before rendering.
- Server layouts re-check roles.
- Customer ownership is checked in data access helpers.
- Prisma must not be imported into middleware.
