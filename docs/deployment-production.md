# Deployment Guide — Vercel

This guide explains how to deploy the `ssconstruction` app to Vercel and configure the required services (Neon PostgreSQL, Cloudinary) and environment variables. Transactional email is optional and can be enabled later.

1. Prerequisites

- A Vercel account and access to the project.

* Neon PostgreSQL database and connection strings.
* Cloudinary account and credentials.

2. Environment variables (set in Vercel Project → Settings → Environment Variables)

- `DATABASE_URL` - Neon primary connection (used at runtime by Prisma).
- `DIRECT_URL` - Neon direct connection string for migrations and some providers.
- `AUTH_SECRET` - a 32+ character secret for NextAuth or auth.js. Generate with: `npx auth secret`.
- `NEXT_PUBLIC_APP_URL` - production app URL (e.g., `https://www.example.com`).
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_FROM` - default from address.
- `LOG_LEVEL` - production log level (e.g., `info` or `warn`).

3. Vercel Settings

- Framework Preset: Next.js.
- Build Command: `npm run build`.
- Output Directory: leave empty (Next manages it).
- Environment: Ensure production variables are added to `Production` and `Preview` as needed.
- Deploy Hooks: create a deploy hook for automated deployments.

4. Database Migrations and Prisma

- In CI or locally, run migrations before or as part of deployment:
  ```bash
  npx prisma migrate deploy
  ```
- Generate Prisma Client in build (already part of `npm run build` via `prisma generate`).

5. Assets and Images

- Add required images to `public/images/` (`og-default.jpg`, `logo.png`, `favicon.ico`).
- Cloudinary is allowed in `next.config.ts` via `remotePatterns` for optimization.

6. Run a test deployment

- Push a branch and trigger a Vercel deploy or use `vercel --prod` from the CLI (with caution).

7. Post-deploy checks

- Visit the site and check Open Graph preview using Twitter Card Validator or Slack preview.
- Verify API routes: `/api/health`, `/api/auth/...`, `/api/reminders/daily`.

8. Rollback

- Use Vercel’s deployment history to rollback to the last working deployment.
