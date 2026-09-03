# Здорова Родина

Production-oriented Next.js application prepared for Vercel Pro.

## Runtime

- Node.js 22.13 or newer
- Vercel Functions / Next.js 16
- Neon Postgres through `DATABASE_URL`
- Vercel Blob for admin-uploaded images

## Local development

```bash
npm install
copy .env.example .env.local
npm run db:schema
npm run dev
```

Do not commit `.env.local` or administrator credentials.

## Required production variables

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `PUBLIC_FORM_RATE_LIMIT_SECRET`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `OPENAI_API_KEY`
- `BOOTSTRAP_DEFAULT_CONTENT=false`

## Migration from Cloudflare D1

1. Create a Neon database and set `DATABASE_URL` locally without committing it.
2. Apply the PostgreSQL schema with `npm run db:schema`.
3. Export D1 with Wrangler or use the private backup in `backups/`.
4. Import once with `npm run db:import:d1 -- <path-to-export.sql>`.
5. Keep `BOOTSTRAP_DEFAULT_CONTENT=false` after the import.

The importer refuses to merge into non-empty content tables unless
`ALLOW_D1_MERGE=true` is deliberately set.

## Release checks

```bash
npm run typecheck
npm run lint
npm run test:security
npm run build
```

The secure build also rejects secret files in the deployment output. Connect
the custom domain only after the Vercel preview, database persistence, uploads,
admin login, public forms and rollback have been verified.
