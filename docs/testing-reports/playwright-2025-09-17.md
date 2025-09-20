# Playwright Regression Suite — 2025-09-17

## Overview
- **Command:** `npm run test`
- **Environment:** Local machine without Supabase public env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) exported to the Playwright process.
- **Result:** ❌ 15/78 tests passed. Remaining specs crashed during app boot because `getRequiredEnv` threw at runtime.

## Failure Synopsis
- Next.js dev server surfaced a runtime error: `Environment variable NEXT_PUBLIC_SUPABASE_URL is not set`.
- The error fired during `/auth/login` mount when `createSupabaseBrowserClient()` attempted to read the missing public env key.
- As a result, every spec depending on the dashboard rendered the error overlay and aborted early.

## Required Fix
1. Export the Supabase public keys before launching the suite (either via `.env.local` or shell):
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
   export NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
   ```
2. Ensure the private keys used by the test helpers are also populated:
   ```bash
   export SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
   export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
   ```
3. Re-run `npm run test` so Playwright can create the test user and drive the auth flow.

## Artefacts
- Playwright HTML report (failed run): `playwright-report/index.html`
- Raw error snapshot: see `playwright-report/data/35fd542230c021675dccbf57dfc2c0462598d460.md`.

## Next Actions
- Repeat the suite after setting the Supabase env vars; capture the successful report once all 78 tests pass.
- Update the orchestrator baseline gate when the green run is available.
