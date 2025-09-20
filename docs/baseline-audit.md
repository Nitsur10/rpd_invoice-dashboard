# Baseline Audit Log

## 2025-01-16 – Auth Flow Verification
- Confirmed Supabase client helpers are available for browser and server usage.
- Normalised env access via `src/lib/env.ts` so middleware and API routes require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` explicitly.
- Updated `/auth/login` to use the shared browser client helper.
- Middleware, server helpers, and auth API routes now import the shared env helper to remove `string | undefined` TypeScript warnings and guarantee runtime checks.
- Next steps: run `npm run dev` with Supabase credentials populated to verify `/auth/login` renders and can establish a session; follow up with Playwright auth flow repair.

## 2025-02-24 – Baseline Stabilisation Audit
- Migrated the auth route from the deprecated `(auth)` segment to `/auth/login`, aligning middleware protection rules and fixing the redirect loop that blocked unauthenticated access.
- Adjusted middleware matcher set so `/auth/*` routes bypass the Supabase session guard while keeping dashboard surfaces protected.
- Wrapped the login form in a suspense-friendly shell to satisfy Next.js 15 `useSearchParams` requirements for static optimisation.
- Captured lint/test/build status: `npm run lint` passes (warnings only), `npm run build` succeeds, Playwright E2E currently blocked in the sandbox (cannot bind to ports); added notes below for mitigation.
- Established invoice-dashboard orchestrator blueprints (ID-001 → ID-003) with client quality gates for Baseline, Enhancement, and Deployment phases.

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (mirrors public anon key for server utilities)
- `E2E_USER_EMAIL` (optional Playwright override)
- `E2E_USER_PASSWORD` (optional Playwright override)
- **Supabase DB password** (reset Sept 2025): `RpdInvoice!2025Secure`

Ensure the same values are configured in Vercel project settings under **Environment Variables (Production & Preview)** before deployment.

### Test & Build Status (Sandbox)
- `npm run lint` → success (84 warnings in legacy files; no errors, rule relaxations recorded in `eslint.config.mjs`).
- `npm run build` → success; Supabase persistence falls back gracefully when filesystem writes are unavailable.
- `npm run test` → blocked (`listen EPERM`) because the hosted sandbox forbids binding to `127.0.0.1:3002`. Local or CI environments without these restrictions should run Playwright successfully once the dev server can start.

## 2025-09-17 – Middleware + Test Harness Check
- Audited middleware whitelist and documented findings in `docs/middleware-audit.md` to close the `/auth/login` access regression.
- Ran `npm run lint` (warnings only) and `npm run build` to confirm the app compiles with the updated auth flow.
- Local `npm run test` attempt aborted at app startup: Next.js reported `Environment variable NEXT_PUBLIC_SUPABASE_URL is not set` and only 15/78 specs recorded a pass.
- Logged the failing run in `docs/testing-reports/playwright-2025-09-17.md`; next rerun must export Supabase env vars before launching Playwright.

## 2025-09-18 – Playwright Regression Pass
- Applied lazy Supabase client initialization and custom Playwright dev-server launcher to guarantee env vars at runtime.
- `npm run test` now passes end-to-end (78/78 specs across Chromium, Firefox, WebKit) with report stored at `playwright-report/index.html`.
- Documented the green run in `docs/testing-reports/playwright-2025-09-18.md`; screenshots refreshed under `screenshots/`.
- Refined primary navigation (removed API Status), restored dashboard hero layout, and aligned `/invoices` + `/kanban` headings to the RPD gradient style for client-facing views.
- Baseline Testing Agent ready to hand off to Documentation for QA sign-off.
