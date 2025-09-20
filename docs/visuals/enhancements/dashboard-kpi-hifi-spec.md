# ID-002 — Dashboard KPI Hi-Fi Specification

_Last updated: 2025-09-18T23:15:00Z_

This document translates the wireframes into a high-fidelity specification. Every value references existing RPD design tokens (`src/app/globals.css`) or standard Tailwind units to ensure implementation consistency.

## 1. Layout Grid
| Breakpoint | Container | Grid | Gutters | Notes |
|------------|-----------|------|---------|-------|
| Mobile (≤767px) | `max-width: 100%; padding: 16px` | Single column | 16px | Stack hero, filter CTA, KPI cards, charts. |
| Tablet (768–1023px) | `max-width: 960px; padding: 24px` | 12-column grid (`grid-cols-12`) | 24px | KPI cards span 6 columns, charts each span 6 columns; sticky filter summary spans 12 columns. |
| Desktop (≥1024px) | `max-width: 1280px; padding: 40px` | 12-column grid | 32px | KPI cards each span 3 columns; charts staggered (Category Breakdown spans 7, Top Vendors spans 5). Side panel uses 4 columns if enabled. |

## 2. Hero Header
- **Typography:**
  - Title: `rpd-heading-xl` (32px desktop, 28px tablet, 24px mobile).
  - Subtitle: `rpd-body-lg` with `text-muted-foreground`.
  - Timestamp: `font-mono`, `text-sm`, `color: hsl(var(--rpd-text-muted))`.
- **Quick range chips (desktop only):**
  - Component: `rpd-btn-secondary` variant with rounded-full shape.
  - States:
    - Default: `background: hsl(var(--rpd-surface-overlay))`, `text: hsl(var(--rpd-text-secondary))`.
    - Hover: lighten background by 6%.
    - Active: apply gradient border `linear-gradient(135deg, hsl(var(--rpd-gold-primary)) 0%, hsl(var(--rpd-gold-secondary)) 100%)` with inner background `hsl(var(--rpd-surface-base))`.

## 3. Filter Controls
- **Mobile/Tablet CTA:** primary button using `rpd-btn-primary` with icon `Filter (lucide-filter)`.
- **Desktop Side Panel:**
  - Card container: `rpd-card` with `padding: 24px`, `border: 1px solid hsl(var(--rpd-border-default))`, `border-radius: 24px`.
  - Sections:
    - "Active filters" list using pill badges (`rpd-badge-info`) containing filter name + close icon.
    - Realtime toggle: `Switch` from shadcn with custom token colors (`--rpd-gold-primary` for checked state).
  - Sticky behavior: `position: sticky; top: 120px;`.

## 4. KPI Cards (StatsCards)
- **Dimensions:**
  - Mobile: full width, `min-height: 140px`.
  - Tablet: width `calc(50% - 12px)`, `min-height: 150px`.
  - Desktop: width `calc(25% - 24px)`, `min-height: 160px`.
- **Backgrounds:** use gradient tokens already defined (`primary`, `success`, `warning`, `danger`), ensure contrast ratio > 4.5.
- **Content layout:**
  - Top row: Label (`text-sm`, uppercase, `tracking-wide`), icon container 32x32 with overlay gradient.
  - Value row: `text-4xl` (desktop), `text-3xl` (tablet), `text-2xl` (mobile) with `tabular-nums` and gradient text for monetary values.
  - Trend row: badge using `Badge` component with left icon `TrendingUp/TrendingDown`, `font-size: 12px`.
- **Realtime indicator:** small ring at top right of card showing status (online/offline). Use `.animate-pulse` with color tokens `emerald-400` for normal, `red-400` for stale data.

## 5. Charts
- **Category Breakdown:**
  - Frame: `rpd-card-elevated`, `padding: 24px` (desktop) / `20px` (tablet) / `16px` (mobile).
  - Legend: position top-left, `flex-wrap`, `gap: 12px`.
  - Colors: use gradient-based palette derived from brand navy and gold; provide hex values `#123B5D`, `#1E4A70`, `#BC9950`, `#E6C985`.
- **Top Vendors:**
  - Mirror styling; include horizontal scroll for legend on mobile.
  - Provide fallback message for empty data with icon `BarChart` in muted color.

## 6. Motion & Accessibility
- Animations limited to `transform` and `opacity`, duration ≤200ms.
- Provide `prefers-reduced-motion` overrides: disable pulse, scale, and gradient shimmer.
- Ensure color-only indicators (trend badges, realtime dot) include text labels.
- All interactive elements require `focus-visible` ring using `outline: 2px solid hsl(var(--rpd-gold-primary)); outline-offset: 2px`.

## 7. Assets & Export
- Icon set: `lucide-filter`, `lucide-refresh-cw`, `lucide-activity`, `lucide-trending-up`, `lucide-trending-down`.
- Provide hi-fi mockups (PNG/SVG) exported at 1x and 2x: place in `docs/visuals/enhancements/renders/dashboard/` once created externally.
- Document analytics events: `dashboard.filter_applied`, `dashboard.range_quick_select`, `dashboard.realtime_toggle`.

## 8. Implementation Checklist
- [ ] Update `StatsCards` props to accept `variant`/`realtimeStatus` to match design.
- [ ] Introduce `DashboardFilterPanel` component referencing side panel spec.
- [ ] Update `CategoryBreakdown`/`TopVendors` to use consistent padding and legend layout.
- [ ] Add CSS utilities for quick range chips and realtime indicator.
