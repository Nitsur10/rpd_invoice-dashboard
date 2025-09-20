# Playwright Smoke — Invoices Flow (2025-09-19)

## Context
- **Test suite:** `tests/e2e/invoices.spec.ts`
- **Command:** `npx playwright test tests/e2e/invoices.spec.ts --reporter=list`
- **Duration:** ~28s
- **Browsers:** Chromium, Firefox, WebKit (parallel workers)

## Outcome
- ✅ All 12 test cases passed.
- ⚠️ Runtime logs show Supabase schema gaps (`invoice_saved_views`, `Invoice.id`). The API route recovered by serving the mock dataset, so assertions still validated the UI behaviour.
- ℹ️ Orchestrator persistence warnings were cleared by consolidating the Node and browser implementations; no additional Playwright noise remains.

## Follow-up
1. Confirm Supabase migrations have been applied to expose `invoice_saved_views` and the `Invoice` table columns before hitting live data.
2. Once migrations land, rerun the invoices spec to verify the UI against real Supabase responses.
