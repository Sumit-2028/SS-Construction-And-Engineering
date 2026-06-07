# Construction Management Platform

Enterprise foundation for a construction company delivering house construction,
building construction, civil contracting, and renovation projects.

This repository currently contains architecture only. Business workflows,
project CRUD, dashboards, estimates, contracts, billing, and document features
are intentionally not implemented yet.

## Quick Start

```powershell
npm install
Copy-Item .env.example .env.local
npx auth secret
npm run db:generate
npm run dev
```

For macOS/Linux:

```bash
npm install
cp .env.example .env.local
npx auth secret
npm run db:generate
npm run dev
```

## Core Commands

```bash
npm run dev          # Start Next.js locally
npm run build        # Generate Prisma client and build Next.js
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create local Prisma migration
npm run db:deploy    # Apply migrations in deployed environments
npm run db:studio    # Open Prisma Studio
```

## Folder Structure

```text
.
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   └── development-conventions.md
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── (marketing)/
│   │   └── api/
│   ├── auth.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── providers/
│   │   └── ui/
│   ├── config/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── email/
│   │   ├── errors/
│   │   └── storage/
│   ├── server/
│   │   └── actions/
│   └── types/
├── components.json
├── next.config.ts
├── tailwind.config.ts
└── vercel.json
```

## Configuration Files

- `next.config.ts`: Next.js app configuration and Cloudinary image host.
- `tailwind.config.ts`: shadcn-compatible Tailwind setup with navy/orange construction tokens.
- `components.json`: shadcn/ui registry and alias configuration.
- `prisma/schema.prisma`: Auth.js persistence and construction-domain foundation schema.
- `.env.example`: local and deployment environment variable contract.
- `vercel.json`: Vercel build/install defaults.

## Architecture Docs

- [Architecture](docs/architecture.md)
- [Authentication](docs/authentication.md)
- [Database Design](docs/database-design.md)
- [Development Conventions](docs/development-conventions.md)
- [Deployment](docs/deployment.md)
# SS-Construction-And-Engineering
