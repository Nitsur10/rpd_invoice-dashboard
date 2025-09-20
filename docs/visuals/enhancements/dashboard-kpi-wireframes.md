# ID-002 — Dashboard KPI Enhancement Wireframes

_Last updated: 2025-09-18T23:05:00Z_

These annotated wireframes capture the design direction for the Dashboard KPI experience across the primary breakpoints.

---

## 1. Mobile (≤ 767px)
```
┌───────────────────────────────────────────────┐
│ Header: "RPD Invoice Dashboard"               │
│ Subtitle + clock (stacks vertically)          │
├───────────────────────────────────────────────┤
│ [Filter Button]                               │
│  - Single primary button using `.rpd-btn-*`   │
│  - Taps open full-screen sheet                │
├───────────────────────────────────────────────┤
│ KPI Stack (single column, 16px gap)           │
│ ┌──────────────┐ ┌──────────────┐             │
│ │ Total Inv.   │ │ Total Amount │             │
│ └──────────────┘ └──────────────┘             │
│ ...                                            │
│ Notes:                                         │
│ - Cards use `rpd-card-elevated` for depth      │
│ - Trend badge wraps to second line             │
├───────────────────────────────────────────────┤
│ Charts                                         │
│ ┌───────────────────────────────┐              │
│ │ Category Breakdown (full width)│             │
│ └───────────────────────────────┘              │
│ Spacer (16px)                                  │
│ ┌───────────────────────────────┐              │
│ │ Top Vendors                   │              │
│ └───────────────────────────────┘              │
└───────────────────────────────────────────────┘
```
**Annotations**
- Primary spacing: 16px outer padding, 12px card internal padding.
- Typography: `rpd-heading-xl` scales to 24px, cards use `text-2xl` for values.
- Motion: replace hover scaling with subtle opacity (respect `prefers-reduced-motion`).

---

## 2. Tablet (768–1023px)
```
┌────────────────────────────────────────────────────┐
│ Header (title + subtitle left, clock right)        │
│ Filter button group right-aligned (Filter | Reset) │
├────────────────────────────────────────────────────┤
│ KPI Grid (2 columns x 2 rows, 24px gap)            │
│ ┌──────────────────┐ ┌──────────────────┐          │
│ │ Total Invoices   │ │ Total Amount     │          │
│ └──────────────────┘ └──────────────────┘          │
│ ┌──────────────────┐ ┌──────────────────┐          │
│ │ Pending          │ │ Overdue          │          │
│ └──────────────────┘ └──────────────────┘          │
├────────────────────────────────────────────────────┤
│ Charts (two column layout)                         │
│ ┌──────────────────────┬────────────────────────┐ │
│ │ Category Breakdown   │ Top Vendors             │ │
│ │ - Shared legend top  │ - Scrollable legend     │ │
│ │ - 24px padding       │ - 24px padding          │ │
│ └──────────────────────┴────────────────────────┘ │
└────────────────────────────────────────────────────┘
```
**Annotations**
- Align cards to 320px min-width to avoid wrapping.
- Introduce sticky filter summary bar above charts showing selected range + realtime status dot.
- Charts share consistent padding for axis labels; ensure 12px min tap targets.

---

## 3. Desktop (≥ 1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│ Left Column (60%)                                │ Right Column │
│ ------------------------------------------------ ├─────────────┤
│ Hero Header                                      │ Filter Panel │
│ - Title, subtitle, timestamp                     │ - Summary of │
│ - Quick action chips (Today | 7d | 30d)          │   applied    │
│                                                  │   filters    │
│ KPI Row (4-up, 32px gap)                         │ - Toggle for │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │   realtime   │
│ │Card │ │Card │ │Card │ │Card │                  │   updates    │
│ └─────┘ └─────┘ └─────┘ └─────┘                  │             │
│ Charts (staggered)                               │             │
│ ┌────────────────────────────┐                   │             │
│ │ Category Breakdown         │                   │             │
│ └────────────────────────────┘                   │             │
│               ┌────────────────────────────┐     │             │
│               │ Top Vendors                 │     │             │
│               └────────────────────────────┘     │             │
└─────────────────────────────────────────────────────────────────┘
```
**Annotations**
- Apply `max-w-7xl` container with 40px section padding.
- KPI cards emphasise amounts with gradient text; include micro sparkline placeholder.
- Filter panel uses `rpd-card` with sticky positioning; list active filters as pill badges with dismiss icons.

---

## Implementation Notes for Component Teams
- Provide precise spacing tokens: base unit 8px; use multiples listed above per breakpoint.
- Document motion variants for realtime indicator (pulse on success, neutral idle).
- Supply assets or references for any new iconography (sparkline, realtime dot) before build.
