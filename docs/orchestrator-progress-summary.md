# Orchestrator System Progress

This document tracks the staged build-out of the enhanced orchestrator for the Next.js 15 dashboard.

## Implemented Foundations

- **Core types & contracts:** `src/lib/orchestrator/types.ts` formalises workflow, agent, quality gate, and handoff schemas used by all agents.
- **Event bus:** `event-bus.ts` provides a lightweight pub/sub for orchestrator events, enabling live updates and downstream analytics.
- **Workflow registry:** `workflow-registry.ts` manages FeatureWorkflow lifecycles (FT-### IDs, agent progress, quality scores, history) and emits events on state changes.
- **Quality gates:** `quality-gates.ts` + `quality-gate-service.ts` encapsulate gate definitions and scoring, feeding aggregate quality metrics back into workflows.
- **Handoff framework:** `handoff-service.ts` validates agent dependencies, records transitions, and ties handoffs into the event stream.

## Real-Time Monitoring Integration

- **TanStack Query bridge:** `query-bridge.ts` syncs workflow & handoff data into React Query caches, keeping dashboards live via the event bus.
- **Provider wiring:** `src/components/providers/query-provider.tsx` registers the bridge, while `src/hooks/use-orchestrator-workflows.ts` exposes a ready-to-use hook.

## Persistence

- **File-backed storage:** `persistence.ts` now owns the Node-side persistence logic, writing orchestrator state to `data/orchestrator-state.json` and reviving Date fields on load.
- **Browser shim:** `persistence.browser.ts` provides an in-memory fallback that Webpack aliases for client bundles, keeping React Query integrations lightweight while server code persists to disk.
- **Managers hydrated:** Both the workflow registry and handoff manager load from the persisted state on boot and re-save after mutations.

## Visual Reporting

- **Plotly dashboard export:** `scripts/workflow_dashboard.py` reads the persisted orchestrator state and renders a per-feature agent progress dashboard, saving PNG/SVG artefacts under `docs/visuals/`. Run with `python scripts/workflow_dashboard.py` (requires `plotly`, `pandas`, `kaleido`).
- **Live dashboard widget:** `AgentWorkflowPlot` (`src/components/orchestrator/agent-workflow-plot.tsx`) embeds the same visual inside `/status`, loading Plotly from CDN and sourcing data via `useOrchestratorWorkflows` for real-time updates.

## Next Candidates

1. Elevate persistence to Supabase if multi-instance coordination is required.
2. Build UI surfaces leveraging `useOrchestratorWorkflows` and handoff query keys.
3. Add unit/integration tests once legacy TypeScript errors are resolved.

## Invoice Dashboard Enhancements (2025-02-24)

- Seeded dedicated Invoice Dashboard workflows (ID-001 ⇢ ID-003) that mirror the master plan milestones and carry client priorities, blockers, and mitigation plans.
- Registered Baseline/Enhancement/Deployment quality gates mapped to automated (lint, build, Playwright, Lighthouse) and manual (client review, UAT, rollback rehearsal) validations.
- Query bridge now invokes `ensureInvoiceDashboardWorkflows()` so React Query consumers receive hydrated task boards on mount without manual bootstrapping.
- Blueprint metadata persists acceptance criteria, timeline day alignment, and live agent rosters for downstream dashboards.

## 2025-09-18 Update
- Supabase clients now lazy-load credentials at runtime, eliminating env timing errors.
- Custom Playwright dev-server launcher ensures `.env.local` is injected before Next.js boots.
- Full regression suite (78 tests) passed; results logged in docs/testing-reports/playwright-2025-09-18.md.
- Client-facing navigation polished (removed API Status, refreshed RPD headings) while keeping internal status tooling behind `/status`.
- Documentation Agent activated to compile QA handoff materials.
- Enhancement briefs for **ID-002 Dashboard KPI Enhancement** and **ID-003 Invoice Filters & CSV Export** reviewed; Design System Agent moved to `Active` with downstream agents queued, quality gates initialised, and blockers/mitigations synced from the latest briefs.

_Last updated: 2025-09-18T22:48:26Z_
