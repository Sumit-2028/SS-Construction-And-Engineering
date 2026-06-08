# SEO & Performance Guide

This document summarizes the SEO and performance setup added to the project and recommended next steps.

## What I added

- Site-wide metadata and Open Graph defaults in `src/app/layout.tsx`.
- JSON-LD Organization structured data component at `src/components/seo/structured-data.tsx`.
- Sitemap generator at `src/app/sitemap.ts` (served at `/sitemap.xml`).
- `public/robots.txt` pointing at the sitemap.

## Quick local setup

1. Ensure your `.env.local` contains `NEXT_PUBLIC_APP_URL` matching your deployment URL.
2. Run:

```bash
npm ci
npm run build
```

## SEO notes

- Metadata: `src/app/layout.tsx` contains `metadata` with `openGraph`, `twitter`, `keywords`, and `icons`.
- Structured Data: `StructuredData` injects an Organization JSON-LD block. Extend `sameAs` and `contactPoint` with real values.
- Sitemap: `sitemap.ts` returns static routes. For dynamic content (projects, blog posts), extend the file to fetch slugs from your DB and append them.
- Robots: `public/robots.txt` added. Update as needed for staging/blocked environments.

## Performance notes

- Image optimization: The Next config already allows `res.cloudinary.com`. Use `next/image` for all images and rely on automatic optimization and lazy loading.
- Caching: Use `revalidate` and `Cache-Control` for route handlers and APIs. For dynamic pages that rarely change, consider `revalidate` with ISR.
- Server Components: This project uses the App Router and Server Components by default — prefer server components for data-heavy UI and reduce client JS.
- Edge runtime warnings: third-party libs such as `jose` may use Node APIs not available in Edge — keep auth and crypto code in Node runtimes or switch routes to `runtime = 'nodejs'`.

## Next steps

- Extend `sitemap.ts` to include dynamic routes (query your DB for slugs).
- Add `og-default.jpg`, `logo.png`, and `favicon.ico` into `public/images/` if not present.
- Configure CI/CD secrets (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`).
- Optionally: relax env validation during build if your CI can't provide secrets (we can add a guarded change in `src/config/env.ts`).
