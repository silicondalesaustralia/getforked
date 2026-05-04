# getforked.dev

Lead-generation and internal growth engine for custom SaaS replacement projects.

## Getting Started

Install dependencies:

```bash
npm install
```

Set environment variables:

```bash
cp .env.example .env.local
```

Run local development:

```bash
npm run dev
```

## Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run worker:video`

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + reusable component architecture
- Neon Postgres + Drizzle ORM
- Auth.js/NextAuth for admin protection
- S3 object storage with signed upload URLs
- Worker scaffold for EC2/Fargate video processing
- TanStack Query + Zustand for client state
- GitHub Actions CI for lint/typecheck/build

## Deployment

- Frontend and API routes deploy on Vercel.
- Media storage and processing run on AWS (S3 + container worker).
- Configure all environment variables in Vercel and worker runtime.

## Core Paths

- `app/(marketing)` public pages, blog, and industry funnels
- `app/admin` protected internal dashboard
- `app/api` lead capture, upload, scheduling, publishing
- `lib/db` schema and Neon client
- `lib/publish` platform publishing adapters
- `workers/video` processing worker entrypoint and Dockerfile
