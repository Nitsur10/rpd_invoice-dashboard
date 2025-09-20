# Component Architect Blueprint — ID-002 & ID-003

_Last updated: 2025-09-18T23:35:00Z_

## 1. Audit Summary
- **Dashboard stack**
  - `src/app/(dashboard)/page.tsx` orchestrates layout, hero header, and chart components using React Query (`fetchDashboardStats`).
  - `src/components/dashboard/stats-cards.tsx` manages its own query and loading states; needs consolidation so data is fetched once and shared.
  - Charts (`src/components/charts/category-breakdown.tsx`, `top-vendors.tsx`) expect preformatted arrays and handle loading placeholders.
- **Invoices stack**
  - `src/app/(dashboard)/invoices/page.tsx` controls TanStack Table state, React Query fetching, CSV export logic, and filter search.
  - Toolbar + data table components exist in `src/components/invoices/*`; current filters limited to status/category chips and basic search.
  - Export currently pulls 1000 rows client-side; no progress UI or saved views.

---

## 2. ID-002 — Dashboard KPI Enhancement
### 2.1 Component Changes & Additions
| Component | Location | Action |
|-----------|----------|--------|
| `DashboardPage` | `src/app/(dashboard)/page.tsx` | Refactor to consume a shared stats provider, render responsive layout, integrate filter controls & realtime toggle. |
| `StatsCards` | `src/components/dashboard/stats-cards.tsx` | Convert to presentation-only component receiving data + props (`onRangeChange`, `realtimeStatus`, `variant`). |
| `DashboardFilterPanel` (new) | `src/components/dashboard/dashboard-filter-panel.tsx` (new) | Encapsulate date range selector, quick range chips, realtime toggle, active filter badges. |
| `DashboardRealtimeIndicator` (new) | Reusable UI component | Small badge/pill indicating data freshness. |
| `DashboardChartsLayout` (new) | `src/components/dashboard/charts-layout.tsx` | Manage staggered chart grid and shared legend layout. |

### 2.2 State & Data Flow
- Introduce `useDashboardStats` hook (in `src/hooks/use-dashboard-stats.ts`) wrapping React Query with memoized selectors and optional realtime subscription.
- Context provider `DashboardStatsProvider` (server or client component) to fetch stats once and supply via React Context to `StatsCards`, charts, and filter panel.
- Filter panel raises events (`onRangeChange`, `onSegmentChange`, `onRealtimeToggle`) updating provider state; React Query refetches with new params.
- Support optimistic UI by updating context immediately while fetch resolves; fallback to skeleton states if stale > threshold.

### 2.3 Responsiveness & Layout
- Use CSS grid utilities to apply spec: mobile single column, tablet 2-column, desktop 4-card row + staggered charts.
- Add `useMediaQuery` helper or rely on tailwind responsive classes for chip display vs panel collapse.
- Ensure filter side panel uses CSS sticky with `top` tied to header height.

### 2.4 Error/Loading Handling
- Shared provider manages loading/error states once; pass down via context to cards & charts.
- New `DashboardErrorState` component with retry button calling `refetch` from query.
- Real-time toggle greyed out when service offline (if Supabase channel fails).

### 2.5 Testing Hooks
- Export context and hooks for unit testing pure logic (`useDashboardStats` with mocked fetcher).
- Provide data-test ids: `data-testid="kpi-card-total"`, `data-testid="dashboard-filter-apply"`, etc.
- Playwright selectors leverage new filter panel + quick chips.

---

## 3. ID-003 — Invoice Filters & CSV Export
### 3.1 Component Changes & Additions
| Component | Location | Action |
|-----------|----------|--------|
| `InvoicesPage` | `src/app/(dashboard)/invoices/page.tsx` | Split responsibilities: container handles query state, passes down to toolbar, sidebar/drawer, table, export controller. |
| `InvoiceFiltersToolbar` | `src/components/invoices/data-table-toolbar.tsx` | Rebuild to render filter chips, save view button, export progress indicator. |
| `InvoiceFilterDrawer` | `src/components/invoices/filter-drawer.tsx` (new) | Mobile/tablet filter slide-over implementing hi-fi spec sections. |
| `InvoiceFilterSidebar` | `src/components/invoices/filter-sidebar.tsx` (new) | Desktop variant with sticky layout. |
| `InvoiceFilterChips` | `src/components/invoices/filter-chips.tsx` (new) | Renders applied filter badges with remove actions. |
| `ExportProgressButton` | `src/components/invoices/export-progress-button.tsx` (new) | Handles export states, progress updates, toast triggers. |
| `SavedViewsModal` | `src/components/invoices/saved-views-modal.tsx` (new) | Manage saved view creation/selection using new schema table. |
| `InvoiceCards` | `src/components/invoices/card-view.tsx` (new) | Mobile card representation when table compresses. |

### 3.2 State Management
- Centralize filter state in `useInvoicesFilters` hook (React Context) storing search, status[], category[], amountRange, vendor[], saved view id.
- Synced with URL via `useSearchParams` + `useRouter` to ensure persistence and shareable links.
- React Query queryKey expands to include serialized filter state; hooking into new Supabase RPC endpoints once available.
- Export flow uses `useMutation` to call export enqueue endpoint; subscribe to server-sent events/WebSocket or poll job status until completion.

### 3.3 Table Integration
- Extend `DataTable` to accept new props: `viewMode` (`table|card`), `isRowSelectable`, `onRowHover`, etc.
- Provide virtualization adjustments for 600px height with sticky header.
- Update column definitions to include quick actions derived from hi-fi spec.

### 3.4 Saved Views & Analytics
- `SavedViewsModal` interacts with API routes (to be implemented) to CRUD saved views; update filter context on selection.
- Emit analytics events on filter/apply/reset/export using existing observability helper.

### 3.5 Mobile Experience
- `InvoiceCards` component handles card layout with actions collapsed into dropdown; responds to filter context updates.
- Filter drawer uses Radix `Dialog`/`Sheet` pattern with focus management and sticky footer actions.

### 3.6 Error/Loading Handling
- Toolbar displays skeleton chips while facet data loads (via new facets endpoint).
- Toast system (existing `useToast` from shadcn) handles export success/error; progress button updates `aria-live` text.
- Table shows empty state component when filter returns zero items; includes “Clear filters” button hooking into filter context reset.

### 3.7 Testing Hooks
- Add `data-testid` attributes (`invoice-filter-chip-status-paid`, `export-progress-button`) for Playwright.
- Provide mock utilities for filter context to facilitate unit tests.
- Ensure card view toggles triggered by viewport tests (Playwright `page.setViewportSize`).

### 3.8 Implementation Status — 2025-09-19
- ✅ `InvoiceFilterSidebar`, `InvoiceFilterDrawer`, and `InvoiceFilterChips` now back the advanced filter UX with inline calendar selection plus quick presets (this month, last month, last 2 months, this quarter, YTD).
- ✅ `SavedViewsModal` persists filter presets through the new `/api/invoices/saved-views` endpoints.
- ✅ `ExportProgressButton` integrates with `/api/invoices/export` and polls job status.
- ✅ `InvoiceFiltersProvider` expanded (date/amount setters, saved view handling) with shared serialization helpers in `src/types/invoice-filters.ts`.

---

## 4. Dependencies & Coordination
- Await Schema Architect deliverables (materialized view, RPCs, facets view, export job API) before final API integration.
- Work with Design System team to ensure tokens, spacing, and icon assets align with hi-fi spec.
- Coordinate with Testing Agent on new selectors and mock data.
- Observability Agent to define events from export workflow and dashboard realtime toggle.

## 5. Implementation Sequencing
1. Introduce shared hooks/providers (`useDashboardStats`, `useInvoicesFilters`). (**In progress** — `DashboardStatsProvider` created.)
2. Refactor existing components to consume providers while keeping current UI functional (feature flags optional). (**In progress** — invoices page now wraps `InvoiceFiltersProvider` and fetches facets.)
3. Layer new UI components (filter panel, export button) behind conditional environment toggle until backend ready.
4. Remove legacy CSV export logic once new pipeline verified.
5. Update Playwright tests to cover new flows; add unit tests for context hooks.
