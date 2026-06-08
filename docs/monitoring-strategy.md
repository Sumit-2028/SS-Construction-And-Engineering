# Monitoring & Observability Strategy

Recommendations to monitor the application in production.

1. Error Tracking

- Use Sentry (recommended) for exception tracking across server and client code.
- Set `SENTRY_DSN` in Vercel secrets and initialize Sentry in server entry points and client (if needed).

2. Structured Logs

- Use `pino` (already in project) with a remote transport (Logflare, LogDNA, Datadog).
- Configure `pino` to redact sensitive fields (`AUTH_SECRET`, `DATABASE_URL`, tokens).

3. Performance Monitoring

- Use Vercel analytics for edge metrics and real user monitoring (RUM) or integrate a dedicated APM (e.g., New Relic, Datadog).

4. Alerts

- Configure alerts for:
  - Error rate spikes
  - High latency thresholds
  - Deployment failures
  - DB connection errors

5. Dashboards

- Create dashboards for:
  - 5xx/4xx rates
  - Request latency p50/p95/p99
  - Background job success/failure (reminders)

6. Log Retention & Privacy

- Retain logs according to your compliance needs and ensure redaction of PII.

7. Incident Response

- Subscribe on-call rotation, Slack or PagerDuty integration for critical alerts.
