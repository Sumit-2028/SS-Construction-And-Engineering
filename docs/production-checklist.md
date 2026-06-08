# Production Checklist

Use this checklist before marking a release as `production`.

- [ ] Environment variables configured in Vercel:
  - `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `CLOUDINARY_*`, `EMAIL_FROM`, `LOG_LEVEL`.
- [ ] Prisma migrations applied: `npx prisma migrate deploy`.
- [ ] Secrets rotated and stored in Vercel/GitHub Secrets.
- [ ] Monitoring configured (Sentry/Log provider) and DSN set.
- [ ] Error logging integrated (Pino transport or Sentry integration).
- [ ] Backups scheduled for Neon DB and verified restore procedure.
- [ ] SSL and custom domain configured on Vercel.
- [ ] Security headers reviewed; CSP, HSTS present.
- [ ] Static assets uploaded and optimized (`public/images/` + Cloudinary CDN).
- [ ] Sitemap and robots.txt present and accessible.
- [ ] Smoke tests passed (health endpoint, login, basic flows).
- [ ] Load test baseline established for critical pages.
