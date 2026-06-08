# Deployment

## Target Platform

- App hosting: Vercel
- Database: Neon PostgreSQL
- ORM: Prisma
- Auth: Auth.js
- Storage: Cloudinary
- Email: optional (Resend or another provider)

## Vercel Setup

Use the included `vercel.json`.

```json
{
  "framework": "nextjs",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

## Environment Variables

Create Vercel environment variables for Production, Preview, and Development:

```text
NEXT_PUBLIC_APP_URL
NODE_ENV
LOG_LEVEL
DATABASE_URL
DIRECT_URL
AUTH_SECRET
AUTH_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_FROM
```

Use separate Neon databases or branches for Production and Preview.

## Database Release Flow

Local development:

```bash
npm run db:migrate
```

Production or preview release:

```bash
npm run db:deploy
```

Do not run `prisma db push` against production.

## Build Flow

Vercel runs:

```bash
npm install
npm run build
```

`npm run build` runs `prisma generate` before `next build`.

## Post-Deploy Checks

Check:

- `/api/health` returns `status: ok`.
- Auth callback route responds at `/api/auth`.
- Vercel function logs are structured JSON.
- Cloudinary credentials are valid before enabling uploads.
- Transactional email is optional; verify sender domain if enabling an email provider.
