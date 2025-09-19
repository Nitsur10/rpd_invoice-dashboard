# Enhancement Delivery Checklist

| Step | Status | Notes |
|------|--------|-------|
| Design system wireframes & hi-fi specs | ✅ | `docs/visuals/enhancements/*` |
| Schema blueprint drafted | ✅ | `docs/schema-architect-plan.md` |
| Supabase migration script authored | ✅ | `supabase/migrations/20250918_invoice_dashboard_enhancements.sql` |
| Migration validated against Supabase | ☐ | Attempted `supabase db push` (hostname lookup failed inside sandbox). Needs execution from trusted network: `supabase db push --db-url postgresql://postgres:RpdInvoice%212025Secure@db.auvyyrfbmlfsmmpjnaoc.supabase.co:5432/postgres`. |
| Sample API payloads documented | ✅ | `docs/api-samples/` |
| Dashboard stats shared provider implemented | ✅ | `src/components/dashboard/dashboard-stats-provider.tsx` |
| Dashboard UI refactored to consume provider | ✅ | `src/app/(dashboard)/page.tsx`, `src/components/dashboard/stats-cards.tsx` |
| Advanced invoice filter components | ✅ | New drawer/sidebar, filter chips, and saved views modal wired to shared context |
| CSV export pipeline UI integration | ✅ | Added client export progress button + `/api/invoices/export` endpoints |
| API routes updated to new schema | ✅ | `/api/invoices` now derives status from `amount_due/due_date`, new saved views & export routes |
| Automated tests updated | ✅ | `tests/api/invoices.test.ts` refreshed for new contracts |
| QA pack & deployment prep | ☐ | Reran `tests/e2e/detailed-investigation.spec.ts` locally after mock fallback; passes on host. Full Playwright regression still recommended prior to sign-off. |
