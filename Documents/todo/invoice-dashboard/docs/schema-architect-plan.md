# Schema Architect Action Plan — ID-002 & ID-003

_Last updated: 2025-09-18T23:25:00Z_

## 1. Current Data Observations
- **Dashboard stats** (`src/app/api/stats/route.ts`)
  - Reads from table `Invoice` (fallback: `invoices`) using service-role client.
  - Computes aggregates client-side (totals, counts, trends) per request, resulting in high latency for larger datasets.
  - Applies minimal filtering (date range) and does not leverage indexes beyond default primary key.
- **Invoices listing** (`src/app/api/invoices/route.ts`)
  - Performs server-side pagination, search, and status filtering via Supabase query builder.
  - Maps UI sort columns to DB columns (invoice_number, supplier_name, created_at, due_date, total).
  - Potentially impacted by lack of composite indexes on (`payment_status`, `created_at`), (`supplier_name`, `created_at`), etc.
- **Export flow** currently fetches up to 1000 rows client-side; no dedicated export job table or server action for large datasets.

## 2. Objectives
| Workflow | Goal | Schema/Data Deliverables |
|----------|------|--------------------------|
| ID-002 Dashboard KPI Enhancement | Ensure accurate, performant KPI aggregates with real-time options. | Materialized view or RPC for aggregated metrics, supporting date range & segment filters; indexes to back new queries; optional realtime channel for refreshed KPIs. |
| ID-003 Invoice Filters & CSV Export | Provide efficient filter facets and large-data export pipeline. | Normalized lookup tables / views for filters, indexes for multi-criteria search, export jobs table + function for streaming CSV. |

## 3. Proposed Schema & Data Tasks

### 3.1 Dashboard KPI Data Pipeline
1. **Create materialized view** `dashboard_invoice_metrics_mv` with columns:
   - `period_start`, `period_end`
   - `total_invoices`, `pending_count`, `overdue_count`, `paid_count`
   - `total_amount`, `pending_amount`, `overdue_amount`, `paid_amount`
   - Pre-compute last-period metrics for trend deltas.
   - Refresh strategy: nightly cron + on-demand `REFRESH MATERIALIZED VIEW` when invoices mutate.
2. **Expose RPC** `rpc_dashboard_metrics(date_from, date_to)` to query the MV with fallback to live aggregation when window exceeds MV coverage.
3. **Add realtime channel** (optional) publishing updates when invoice status/amount changes; ensure row-level security permits server broadcasts only.
4. **Indexes:** ensure base table has indexes on `payment_status`, `due_date`, `invoice_date`, `supplier_name`. Add partial index `idx_invoice_overdue` on `(due_date)` where `payment_status != 'paid'`.

### 3.2 Invoice Filtering Enhancements
1. **Normalize categories/vendors**:
   - Create lookup tables `invoice_categories(id, name)` and `invoice_vendors(id, name, email)` with foreign keys from invoices for consistent filtering.
   - Populate via migration or derived from existing data.
2. **Create view** `invoice_filter_facets_v` that aggregates available filter options (status counts, category counts, vendor counts) for quick loading of filter drawer.
3. **Introduce indexes:**
   - Composite index `idx_invoice_status_created_at (payment_status, created_at DESC)`.
   - `idx_invoice_supplier_trgm` using `pg_trgm` for case-insensitive search on supplier name.
   - `idx_invoice_amount_range (total)` for amount slider.
4. **Persisted filter state support:** optionally add table `invoice_saved_views` storing user-defined filter JSON; ensure schema supports multi-tenant (user_id foreign key).

### 3.3 CSV Export Pipeline
1. **New table** `invoice_export_jobs`:
   - Columns: `id`, `user_id`, `status` (`pending|processing|complete|failed`), `requested_filters` (JSONB), `row_count`, `file_path`, `created_at`, `completed_at`, `error_message`.
2. **Edge Function / RPC** `rpc_enqueue_invoice_export(filters_json)` to insert job and trigger background worker (Supabase Function or external worker).
3. **Storage bucket** `invoice-exports` for generated CSV files with signed URL expiry.
4. **Monitoring**: record durations and success rates; feed into Observability Agent by emitting metrics table `invoice_export_metrics` if needed.

## 4. Data Migration & Deployment Considerations
- Run migrations via Supabase CLI / SQL scripts stored under `supabase/migrations/` (to be created if absent).
- Ensure new objects respect RLS; either disable RLS for materialized view or expose via service-role only.
- Provide backfill scripts for lookup tables and saved views.
- Update `docs/baseline-audit.md` with new required env vars (e.g., storage bucket) and `docs/qa-handoff-summary.md` once validated.

## 5. Coordination Notes
- **Design/System & Component Teams:** share naming conventions for filters and saved views so UI labels match schema fields.
- **Testing Agent:** supply mocked Supabase responses reflecting new aggregates and export job statuses for automated tests.
- **Deployment Agent:** confirm Supabase migrations executed prior to Vercel deploy; update secrets if new env vars introduced.

## 6. Next Steps
1. Draft SQL migration scripts covering views, indexes, tables described above. (**Done** — see `supabase/migrations/20250918_invoice_dashboard_enhancements.sql`.)
2. Validate against current dataset (`Invoice` table) locally using Supabase SQL editor or CLI.
3. Provide sample responses for updated endpoints (`/api/stats`, `/api/invoices`, new export endpoint) to development team.
