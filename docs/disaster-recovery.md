# Disaster Recovery & Backups

This plan outlines steps to recover from major incidents (DB loss, secret leakage, platform failure).

1. Backups

- Neon: enable automated daily backups and point-in-time recovery where available. Verify retention policy.
- Export nightly logical backups (pg_dump) to a secure storage bucket (AWS S3 or equivalent) with versioning.

2. Recovery Steps (Database Loss)

- Identify the latest consistent backup and restore to a new Neon branch if supported.
- Update `DIRECT_URL`/`DATABASE_URL` to point to restored instance in Vercel secrets.
- Run `npx prisma migrate deploy` if required to apply migrations.
- Re-run smoke tests and verify application health.

3. Secret Compromise

- Immediately rotate compromised secrets in Vercel and service dashboards (Cloudinary, email provider).
- Invalidate sessions/tokens where possible.

4. App Rollbacks

- Use Vercel deployment history to rollback to last known good deployment.

5. Communication & Postmortem

- Notify stakeholders and open an incident ticket.
- Record timeline, root cause, and corrective actions.

6. DR Tests

- Schedule quarterly DR drills: restore a backup into a test project and validate app behavior.
