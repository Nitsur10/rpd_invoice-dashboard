# ID-003 — Invoice Filters & CSV Export Hi-Fi Specification

_Last updated: 2025-09-18T23:15:00Z_

High-fidelity design specification for the invoices management surface, expanding on the wireframes and aligning with RPD design tokens.

## 1. Layout & Grid
| Breakpoint | Layout Summary | Notes |
|------------|----------------|-------|
| Mobile (≤767px) | Full-width stack with 16px padding. Table renders in card view with key invoice data. | Filter drawer covers 90% height with rounded top corners (24px radius). |
| Tablet (768–1023px) | Toolbar uses two-row layout; table remains full-width with 600px viewport height for virtualization. | Secondary actions (Reset, Save View) align next to filters. |
| Desktop (≥1024px) | 12-column grid: filter sidebar spans 3 columns (min 320px), table spans 9 columns. | Sidebar collapses to drawer below 1280px via toggle button. |

## 2. Toolbar Components
- **Search Field:**
  - Width: `min(420px, 100%)` (desktop), full width on smaller screens.
  - Icon: `lucide-search` inside left slot; placeholder `"Search invoices by vendor, number, or description"`.
  - Focus ring: `outline 2px solid hsl(var(--rpd-gold-primary))`.
- **Filter Chips:**
  - Base style: `.rpd-badge-info` with `gap: 8px`, includes `lucide-check-square` icon when applied.
  - Close icon: `lucide-x` inside 16x16 circle, `aria-label="Remove filter X"`.
- **Buttons:**
  - `Reset Filters`: `rpd-btn-secondary` with subtle border.
  - `Save View`: `rpd-btn-primary` on desktop, `w-full` ghost button inside drawer on mobile.

## 3. Filter Drawer / Sidebar
- **Panels:**
  - Quick Filters: status chips (Pending, Paid, Overdue) using `.rpd-badge-*` tokens.
  - Category Checklist: multi-column list (2 columns desktop, single column mobile) with custom checkboxes.
  - Amount Range: slider + numeric inputs; slider handle uses brand gold.
  - Vendor Multi-select: search-enabled list with vendor avatars (circle, 24px) and email subtitle.
- **Footer:** Sticky at bottom with gradient background (navy 90% alpha 0.75). Buttons: [Reset All] ghost, [Apply] primary.
- **Interactions:** drawer enters with `transform: translateY(100%)` to `0`; on desktop collapse uses `translateX`.

## 4. Export Workflow
- **Button States:**
  - Idle: `variant="outline"`, icon `lucide-download`.
  - In-Progress: switch to primary background, show spinner (12px) + percentage text.
  - Success: icon `lucide-check`, background gradient (navy to green), auto-dismiss toast.
  - Error: background red gradient, show `lucide-alert-triangle`, provide retry link.
- **Toast Container:** top-right (desktop) / bottom (mobile). Use `rpd-card` styling with translucent backgrounds (`bg-emerald-900/40`, `bg-red-900/40`). Include secondary text with timestamp and note about email delivery if needed.

## 5. Table & Card Views
- **Desktop Table:**
  - Header row height 48px, sticky with drop shadow `var(--rpd-shadow-sm)`.
  - Row hover: background `hsl(var(--rpd-surface-overlay))`, transition 150ms.
  - Row actions: `DropdownMenu` triggered by `lucide-more-horizontal`, includes `View`, `Copy invoice #`, `Copy vendor email`.
  - Selected row indicator: left border `4px solid hsl(var(--rpd-gold-primary))`.
- **Mobile Card:**
  - Container `border-radius: 20px; border: 1px solid hsl(var(--rpd-border-subtle))`.
  - Layout: invoice number + status badge top row; vendor info + amount second row; actions collapsed into two-button row (`View`, `More`).

## 6. Empty / Loading States
- **Skeleton:** reuse `.rpd-skeleton` with 3 placeholder rows in table, and 2 placeholder cards in mobile view.
- **Empty Filters:** centered illustration placeholder (icon `lucide-filter`) with message "No invoices match your filters" and ghost button "Clear filters".
- **Error State:** `Alert` component with icon `lucide-alert-octagon`, copy referencing retry.

## 7. Accessibility & Motion
- Ensure filter chips and drawer controls are keyboard navigable; provide skip link to table.
- Drag focus to filter drawer when opened; return focus to trigger on close.
- Export progress uses both visual percentage and aria-live announcements: `aria-live="polite"` on status text.
- Transitions respect `prefers-reduced-motion`; disable slider animations and drawer easing for those users.

## 8. Analytics Events
- `invoices.filter_opened`
- `invoices.filter_applied`
- `invoices.filter_reset`
- `invoices.export_started`
- `invoices.export_completed`
- `invoices.export_failed`
- `invoices.saved_view_created`

## 9. Asset Delivery
- Provide hi-fi mockups (desktop/tablet/mobile) exported at 1x/2x to `docs/visuals/enhancements/renders/invoices/` once produced in design tooling.
- Supply SVG icons for custom slider handles or any new glyphs if not available in lucide.

## 10. Implementation Checklist
- [ ] Update `DataTableToolbar` to render new chip system and save view CTA.
- [ ] Build filter drawer/sidebar component per spec.
- [ ] Wire export progress states with TanStack Query mutation signals.
- [ ] Apply mobile card layout variant using responsive utilities.
