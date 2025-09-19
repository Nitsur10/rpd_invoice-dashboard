# ID-003 — Invoice Filters & CSV Export Wireframes

_Last updated: 2025-09-18T23:05:00Z_

Annotated wireframes for the invoices table experience, focusing on advanced filters, state persistence, and export feedback.

---

## 1. Mobile (≤ 767px)
```
┌──────────────────────────────────────────────┐
│ Header: "RPD Invoices"                        │
│ Subtitle + count                              │
├──────────────────────────────────────────────┤
│ Toolbar (stacked)                             │
│ [Search input  ]                              │
│ [Filters ▾] [Export ▸]                        │
│  - Filters button opens slide-over sheet      │
│  - Export button disabled until filters load  │
├──────────────────────────────────────────────┤
│ Filter Sheet (slide-over)                     │
│ ┌──────────────────────────────────────────┐  │
│ │ Status multi-select (chips)              │  │
│ │ Category multi-select                    │  │
│ │ Amount range slider + numeric inputs     │  │
│ │ Vendor picker (typeahead)                │  │
│ │ Sticky footer: [Reset] [Apply]           │  │
│ └──────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│ Table (virtualised list)                     │
│ - Rows collapse to card view                 │
│ - Key info (invoice #, vendor, amount)       │
│ - Status badge uses `.rpd-badge-*` classes   │
├──────────────────────────────────────────────┤
│ Export Feedback                              │
│ Toast appears at bottom:                     │
│  "Export started" + spinner                  │
└──────────────────────────────────────────────┘
```
**Annotations**
- Maintain 16px gutters; card row uses border + subtle shadow on hover.
- Filter sheet background uses gradient overlay; ensure focus trap & ESC closing.

---

## 2. Tablet (768–1023px)
```
┌──────────────────────────────────────────────────────────────┐
│ Toolbar (two rows)                                           │
│ ┌─────────────────────────┬────────────────────────────────┐ │
│ │ Search (full width)     │ Applied filters summary (chips)│ │
│ └─────────────────────────┴────────────────────────────────┘ │
│ [Status ▾] [Category ▾] [Amount ▾] [Vendor ▾] [Reset] [Save] │
│ Export button aligned right with badge showing progress      │
├──────────────────────────────────────────────────────────────┤
│ Table (traditional grid, 600px tall virtual window)          │
│ - Sticky header with column labels + sort icons              │
│ - First column retains checkbox selection                    │
│ - Empty state uses icon + CTA when no results                │
├──────────────────────────────────────────────────────────────┤
│ Sticky footer                                                │
│ - Showing results X of Y                                     │
│ - Pagination controls (Prev/Next + page size select)         │
└──────────────────────────────────────────────────────────────┘
```
**Annotations**
- Chips use `.rpd-badge` variants with close icons; ensure keyboard dismissal (Del/Backspace).
- Save View CTA positioned near filters; show modal to name/save when clicked.
- Export button states: idle, in-progress (spinner + `%`), success (check icon + toast), error (red badge).

---

## 3. Desktop (≥ 1024px)
```
┌───────────────────────────────────────────────────────────────────┐
│ Left Column (filters) │ Right Column (table)                      │
│ ----------------------┴-------------------------------------------│
│ Filter Sidebar                                               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Sections:                                               │ │
│ │ 1. Quick Filters (status chips)                         │ │
│ │ 2. Detailed Filters                                     │ │
│ │    - Category checklist                                 │ │
│ │    - Amount range slider + min/max inputs               │ │
│ │    - Vendor multi-select with avatars                   │ │
│ │ 3. Saved Views                                          │ │
│ │ Sticky footer: [Reset All] [Apply Filters]              │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ Table + Export Header                                       │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Summary row:                                             │ │
│ │  "Showing 45 of 3,210 invoices" | Export progress pill  │ │
│ │  Filter breadcrumbs with dismiss icons                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Data grid (virtualised)                                  │ │
│ │ - Sticky column headers                                  │ │
│ │ - Hover reveals row actions (View, Copy, etc.)           │ │
│ │ - Row background animates on status change               │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ Toast area (top-right) for export success/error             │
└───────────────────────────────────────────────────────────────────┘
```
**Annotations**
- Sidebar width: 320px, collapsible; animate with transform for smooth transitions.
- Persist filter state via URL params summary (display under table header).
- Export progress pill uses gradient border and neutral background; matches Observability metrics.

---

## Interaction & Token Notes
- Focus rings: use Tailwind `focus-visible:outline` tied to `--rpd-gold-primary` for primary actions.
- Motion: table row transitions limited to opacity/transform ≤150ms; disable for reduced motion users.
- Toast palette: success `bg-emerald-900/40`, error `bg-red-900/40`, consistent with existing badge tokens.

---

## Assets & Hand-off
1. Capture hi-fi variants (Figma/Sketch) referencing these wireframes; export to `docs/visuals/enhancements/renders/` once ready.
2. Provide icon list (filter, save, export states) to development team with lucide mappings.
3. Log analytics event names in upcoming documentation update (`docs/design-system-plan.md`).
