# Production Deployment Guide – RPD Invoice Dashboard

This guide walks through taking the current Supabase-backed invoice dashboard to production. It replaces the earlier Prisma instructions and reflects the code that is live at commit 7713f4e.

---

## 1. Architecture At A Glance

```
Supabase (Postgres) ⇄ API Routes (/api/*) ⇄ Next.js App Router ⇄ Browser
                               │
                               └── Playwright smoke + visual tests
```

- **Database**: Supabase Postgres using the `Invoice` table (and optional `AuditLog`, `Users`).
- **API Layer**: App Router routes under `src/app/api` call Supabase via a service-role key.
- **Frontend**: Static pages pre-rendered at build, hydrated by TanStack Query for live data.
- **Testing**: Playwright e2e, accessibility, and visual regression suites (see `tests/`).

---

## 2. Prerequisites

- Supabase project (free tier is sufficient) with service-role access.
- Vercel account with permissions on the `rpd-invoice-dashboard` project.
- Local tooling: Node 22.x, PNPM/NPM (repo uses `npm`), `vercel` CLI (already installed).

---

## 3. Supabase Database Setup

1. **Create tables** – run in the Supabase SQL editor:
   ```sql
   create table if not exists "Invoice" (
     id uuid primary key default uuid_generate_v4(),
     invoice_number text unique not null,
     total numeric not null,
     amount_due numeric default 0,
     supplier_name text,
     supplier_email text,
     source text default 'excel_import',
     status text default 'pending',
     invoice_date timestamptz,
     due_date timestamptz,
     created_at timestamptz default now(),
     updated_at timestamptz default now(),
     metadata jsonb default '{}'
   );

   create table if not exists "AuditLog" (
     id uuid primary key default uuid_generate_v4(),
     entity_type text not null,
     entity_id text,
     action text not null,
     changes jsonb,
     created_at timestamptz default now(),
     user_id text,
     ip_address text,
     user_agent text
   );

   create or replace function trigger_set_timestamp()
   returns trigger as $$
   begin
     new.updated_at = now();
     return new;
   end;
   $$ language plpgsql;

   drop trigger if exists set_timestamp on "Invoice";
   create trigger set_timestamp
     before update on "Invoice"
     for each row
     execute procedure trigger_set_timestamp();
   ```

2. **Import seed data (optional)** – use Supabase UI to upload CSV/Excel to the `Invoice` table or connect n8n/Lightsail pipeline to insert rows.

3. **RLS** – keep Row Level Security disabled for now (the API routes use the service role). Introduce RLS policies later alongside auth.

---

## 4. Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client-side reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key used by API routes |
| `SUPABASE_INVOICES_TABLE` | Defaults to `Invoice`; override only if you renamed |

Create `.env.local` locally and configure the same keys in Vercel Project Settings → Environment Variables. Use **Preview** scope for non-production data, **Production** for live data.

---

## 5. Local Verification Checklist

```bash
npm ci
npm run build
npm run test        # Playwright e2e + visual
npm run smoke       # API smoke checks (Supabase required)
```

- Ensure `npm run build` finishes without contacting Google Fonts (fonts are bundled).  
- The Playwright suite needs the service-role key; provide a dedicated testing key with minimal scope if possible.

---

## 6. Deploying With Vercel

1. **Login (if needed)**: `vercel login` or `VERCEL_TOKEN=... vercel whoami`.
2. **Link project** (first time only): `vercel link` → choose `rpd-invoice-dashboard`.
3. **Trigger build**: `vercel --prod` or push to `main` (CI build runs automatically).
4. **Monitor build**: `vercel list rpd-invoice-dashboard` and `vercel inspect <deployment-url> --logs`.
5. **Promote/alias**: The build auto-aliases to `https://rpd-invoice-dashboard-niteshs-projects-b751d5f8.vercel.app` on success.

> If the build ever fails with missing Google Fonts, ensure outbound network access or switch to `next/font/local`.

---

## 7. Post-Deployment Validation

- Visit production URL and compare against `http://192.168.86.196:3002/`.
- Run targeted Playwright specs against the production URL (set `PLAYWRIGHT_BASE_URL`).
- Check Supabase dashboard → Logs for API access and DB writes.
- Configure Vercel Analytics or set up budget monitoring using `src/lib/observability.ts` outputs.

---

## 8. Operational Notes

- The repo purposely ignores TypeScript/ESLint errors during `next build` (see `next.config.js`). Re-enable once CI stabilizes.
- Keep `supabaseAdmin` usage confined to server routes; never expose the service key to the client.
- For background sync (n8n, Lightsail scripts), authenticate via Supabase service key and insert into the `Invoice` table to update dashboards in real time.

---

## 9. Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `@prisma/client did not initialize yet` | Legacy script or dependency requiring Prisma | Remove legacy scripts (e.g., `process-excel-data.js`) and redeploy |
| Build blocked on Google Fonts | No egress during build | Add fonts locally or allow outbound HTTPS |
| Empty dashboard | Supabase env vars missing in Vercel | Re-enter env vars and redeploy |
| API routes 500 | Service role key incorrect or table missing | Regenerate key or migrate schema |

---

With these steps the production deployment mirrors the local dashboard and passes the Vercel build using commit 7713f4e.
