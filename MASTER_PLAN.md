# Master Plan: Invoice Dashboard Enhancements & Vercel Launch

## 0. Status Snapshot (as of current session)
- ✅ Supabase env vars (anon + service role) wired into `.env.local` with shared helpers for server/browser usage and auth middleware scaffolded.
- ✅ `/auth/login` page present with session routes; dashboard layout migrated under `src/app/(dashboard)/**` with user-aware header.
- ⚠️ Playwright suite updated for authenticated flows but still timing out before reaching the login form—login helper and route protection must be aligned.
- ⚠️ Middleware currently blocks the login page; dashboard routes need to be fully hooked under the new layout.
- 🚫 No new Vercel deployments since the auth refactor began; production URL still serves the pre-auth public build.

## 1. Objectives
- ✅ Stabilize the current dashboard baseline and document the production-ready state.
- ✅ Implement page-level enhancements aligned with client expectations.
- ✅ Deploy the dashboard to Vercel with reproducible, auditable workflows.
- ✅ Deliver supporting assets (tests, documentation, previews) for client sign-off.

## 2. Current State Assessment
1. **Inventory & Health Check**
   - Run `npm install`, `npm run lint`, `npm run test`, `npm run build` locally and record outcomes.
   - Capture dependency versions, environment variables, and runtime assumptions in `docs/baseline-audit.md`.
   - Review existing guides (`README.md`, `VERCEL_DEPLOYMENT_GUIDE.md`, docs/).
2. **Data & Config Review**
   - Verify data loaders (`src/lib`) and fixtures in `data/`.
   - Confirm secrets handling; ensure sensitive keys remain in `.env.local` and mirrored in Vercel env settings.
3. **CI/CD & Tooling Snapshot**
   - Audit scripts in `package.json` and `scripts/`.
   - Note current deployment guides (Lightsail, etc.) for migration considerations.

## 3. Workstreams
1. **Baseline Hardening**
   - ✅ Supabase clients & auth env plumbing.
   - ☐ Finish wiring middleware/layout so auth routes (login, dashboard) resolve correctly.
   - ☐ Repair Playwright authenticated flow and ensure lint/test/build succeed.
   - ☐ Document required env vars and their sources.
2. **Feature Enhancements (Per Page)**
   - Define acceptance criteria (UX, data, accessibility) per page.
   - Capture existing UI with screenshots for diff review.
   - Implement updates in feature branches with targeted commits.
   - Update unit/component/integration tests accordingly.
3. **Vercel Deployment**
   - ☐ Update `vercel.json` and project settings if auth or headers require tweaks.
   - ☐ Configure Supabase env vars in Vercel (preview + production).
   - ☐ Trigger preview deploy after auth flow stabilizes; verify login works remotely.
   - ☐ Promote to production once QA signs off.
4. **Quality Assurance & Sign-off**
   - Automate regression suite (Playwright, unit tests) in CI.
  - Conduct visual regression checks (Storybook/screenshots).
  - Document UAT checklist and gather stakeholder approvals.

## 4. Page-Level Enhancement Tracker
| Page | Scope | Owner | Acceptance Targets |
|------|-------|-------|---------------------|
| `/` Dashboard | KPIs accuracy, hero layout polish, responsive charts | TBD | Pixel parity across breakpoints, Lighthouse > 90 | 
| `/invoices` | Advanced filters, CSV export UX, row actions | TBD | Filters covered by tests, export verified | 
| `/kanban` | Drag-and-drop refinements, status badges | TBD | Smooth DnD, accessibility (keyboard support) |
| Shared Components | Nav, theming, analytics | TBD | No unused variants, color contrast AA |

## 5. Deployment Playbook
1. **Prerequisites**
   - Ensure repo on GitHub/GitLab with clean commit history.
   - Gather env secrets: API endpoints, analytics IDs, feature flags.
2. **Vercel Project Setup**
   - `vercel login` & `vercel link` (or dashboard setup).
   - Configure Supabase keys and other env vars in Vercel dashboard.
   - Define custom domains & DNS (if required by client).
3. **Build & Routing**
   - Confirm `npm run build` works in CI container.
   - Review `next.config.js` for image domains, rewrites, edge functions.
   - Ensure middleware and auth routes behave under Vercel preview conditions.
4. **Testing & Promotion**
   - Trigger preview deploy per branch; share links with stakeholders.
   - Validate analytics, auth, and API integrations in preview.
   - Promote to production after sign-off; capture deployment notes.

## 6. QA Strategy
- **Automated**: Jest/React Testing Library for components; Playwright E2E flows (with Supabase auth fixtures); lint & type checks in CI.
- **Manual**: Cross-browser smoke (Chrome, Safari, Edge); responsive breakpoints; accessibility audit (axe, keyboard navigation).
- **Observability**: Set up Vercel analytics or third-party logging; monitor build output and error tracking.

## 7. Timeline & Milestones
| Milestone | Target | Exit Criteria |
|-----------|--------|---------------|
| Baseline Audit Complete | Day 1 | Lint/test/build pass; auth routes reachable; env vars documented |
| Auth Flow Stabilized | Day 2 | Playwright auth helper green; login/middleware verified in preview |
| Enhancement Designs Approved | Day 3 | Wireframes/acceptance criteria signed off |
| Feature Implementation | Days 4-6 | Page updates merged, tests green |
| Vercel Preview Ready | Day 6 | Preview URL stable, QA sign-off |
| Client Review & Feedback | Day 7 | Feedback logged & triaged |
| Final Production Deploy | Day 8 | Production URL live, checklist complete |

## 8. Risk & Mitigation
- **Environment Drift**: Lock dependencies, use `.nvmrc` and `npm ci` in CI.
- **Data Sensitivity**: Mask confidential invoice details in previews if required.
- **Auth Regression**: Add integration tests ensuring middleware permits `/auth/login` and protects dashboard routes.
- **Performance Regressions**: Monitor Core Web Vitals pre/post deploy; add automated Lighthouse checks.
- **Timeline Pressure**: Parallelize enhancements & deployment prep; keep daily stand-ups with stakeholders.

## 9. Immediate Next Actions
1. Export Supabase env vars locally (NEXT_PUBLIC_SUPABASE_URL / ANON KEY / SERVICE ROLE) and rerun `npm run test` so Testing Agent can progress.
2. Capture the next Playwright HTML report and update `docs/testing-reports/playwright-2025-09-17.md` once the suite passes.
3. Mirror the verified env vars into Vercel project settings to keep preview deploys aligned.
4. Resume drafting enhancement briefs for `/dashboard` and `/invoices` after the baseline gate clears.

---
_Created with assistance from Codex GPT to enforce a structured, verifiable delivery plan._
