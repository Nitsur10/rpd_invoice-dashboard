# Design System Action Plan — ID-002 & ID-003

_Last updated: 2025-09-19T13:15:00Z_

## 1. Shared Design Audit
- **Brand tokens** (`src/app/globals.css`): refreshed to the light navy/gold palette (navy `#13243d`, gold `#bc9950`) with updated surface, border, and shadow ramps; reuse these tokens when extending KPI and filter surfaces.
- **Responsive utilities** (`src/app/(dashboard)/page.tsx`, `src/components/dashboard/stats-cards.tsx`, `src/app/(dashboard)/invoices/page.tsx`): current layouts rely on `.rpd-grid-responsive`, Tailwind column grids, and TanStack Table container heights; document existing breakpoints before modifications.
- **Interactive states** (`src/components/ui/*`, `src/lib/variants.ts`): gradients, hover scaling, and badge variants exist; ensure new controls align with class-variance-authority contracts.
- **Accessibility cues** (`tests/e2e/accessibility.spec.ts`): headings and ARIA labels validated; maintain semantics while redesigning filter panels and KPI controls.

### Approved Colour Palette — 2025-09-19
- `--background` `hsl(220 33% 97%)` (F7F9FD) — application canvas
- `--foreground` `hsl(217 52% 16%)` (#13243d) — primary text/navy
- `--primary` `hsl(41 45% 53%)` (#bc9950) — CTA and highlight gold
- `--secondary` `hsl(217 39% 20%)` (#1f2e46) — tonal navy fills for cards/nav
- `--muted` `hsl(216 33% 91%)` — neutral skeletons + table headers
- `--accent` `hsl(218 60% 90%)` — hover/selection wash on light surfaces
- Status palette: success `emerald-100/800`, warning `amber-100/800`, error `rose-100/800`, info `sky-100/800`

## 2. ID-002 Dashboard KPI Enhancement
### Design Targets
- Breakpoint matrix: stack KPI hero + charts on <768px, two-column cards on tablet (768–1023px), staggered 4-up grid + dual charts on ≥1024px.
- Introduce unified date/segment controls with popover sheet that collapses to full-width drawer on mobile.
- Reinforce KPI hierarchy using existing gradient tokens, subtle depth, and reduced motion-friendly animations.

### Deliverables for Design System Agent
1. **Responsive spec** documenting grid, spacing, and typography tokens per breakpoint.
2. **Component guidelines** for `StatsCards` variants (stateful loading/error, real-time indicator, trend deltas) mapped to design tokens.
3. **Chart framing** with padding/legend patterns that maintain legibility on mobile (max 2 lines per label, tooltip contrast).
4. **Interaction states**: define hover/focus styles for hero filter controls, respect prefers-reduced-motion fallbacks.

### Hand-off Notes
- Coordinate with Schema Architect on data granularity so trend tooltips map to available fields.
- Provide figma/sketch references or annotated screenshots for Component Architect before build.

## 3. ID-003 Invoice Filters & CSV Export
### Design Targets
- Expand toolbar into modular filter chips (status, category, amount range, vendor) with overflow handling and clear affordances.
- Persistent state indicators: show active filter count badge and “save view” CTA.
- Export affordance: progress-aware button (idle → in-progress spinner + percentage → success toast) using existing button variants.

### Deliverables for Design System Agent
1. **Filter panel spec** covering desktop horizontal layout and mobile sheet pattern (slide-over with sticky actions).
2. **Chip and badge tokens** leveraging `.rpd-badge-*` classes for selected/hover/focus states, including keyboard focus ring guidance.
3. **Empty/Loading visuals** for server-side pagination + virtualized table (skeleton rows + informative copy).
4. **Export feedback pattern**: status iconography, toast messaging hierarchy, color usage for success/error according to token palette.

### Hand-off Notes
- Align with Schema Architect on available filter facets and expected value ranges before finalizing layouts.
- Document analytics touchpoints (filter change, export start/complete) for Observability Agent so events match UI nomenclature.

## 4. Next Actions
1. Produce annotated wireframes for mobile/tablet/desktop states (see `docs/visuals/enhancements/dashboard-kpi-wireframes.md` and `docs/visuals/enhancements/invoices-filters-export-wireframes.md`).
2. Translate wireframes into hi-fi specs (see `docs/visuals/enhancements/dashboard-kpi-hifi-spec.md` and `docs/visuals/enhancements/invoices-filters-export-hifi-spec.md`).
3. Update design tokens if new spacing or color ramps are required; propose additions in a separate PR before implementation.
3. Schedule review with Feature Builder + Testing agents to lock acceptance criteria for redesigned controls.
