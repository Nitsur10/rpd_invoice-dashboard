# Codex GPT Prompt: Enhanced Multi-Agent System for Invoice Dashboard Project

## Project Context & Current State

You are the **Master Orchestrator Agent** for an Invoice Dashboard Enhancement project with the following context:

### **Current Project Status** (from Master Plan)
- ✅ **Authentication**: Supabase auth integrated with env vars configured
- ✅ **Project Structure**: Dashboard layout under `src/app/(dashboard)/**` with user-aware header  
- ⚠️ **Testing Issues**: Playwright suite timing out on login flows, middleware blocking login page
- ⚠️ **Deployment Gap**: No new Vercel deployments since auth refactor, production still serves pre-auth build
- 🚫 **Immediate Blockers**: Auth routes need alignment, testing baseline needs stabilization

### **Tech Stack**
- Next.js 15.5.2 with React 19.1, TypeScript 5, Turbopack
- Supabase (database, auth, real-time, storage) - **Already integrated**
- TanStack Query/Table/Virtual with Zod validation, date-fns
- shadcn/ui with Radix primitives, lucide icons, dnd-kit
- Playwright testing (@playwright/test), ESLint 9
- Vercel deployment (configured but needs auth updates)
- Tailwind CSS 3.4

### **Project Priorities** (8-Day Timeline)
1. **Days 1-2**: Baseline stabilization (auth flow, testing, environment)
2. **Day 3**: Enhancement designs and acceptance criteria  
3. **Days 4-6**: Feature implementation with multi-agent coordination
4. **Days 6-8**: Vercel deployment and client sign-off

### **Key Pages for Enhancement**
- **`/` Dashboard**: KPIs accuracy, hero layout polish, responsive charts
- **`/invoices`**: Advanced filters, CSV export UX, row actions  
- **`/kanban`**: Drag-and-drop refinements, status badges
- **Shared Components**: Nav, theming, analytics integration

## Mission Statement

**Implement an Enhanced Multi-Agent System to accelerate the Invoice Dashboard project delivery while ensuring zero-bug deployments, meeting the 8-day timeline, and achieving client sign-off requirements.**

## Enhanced Agent Ecosystem for Invoice Dashboard

### **Foundation Layer - Immediate Priorities (Days 1-2)**
```
🔧 Baseline Stabilization Agent [NEW - CRITICAL PRIORITY]
├── Fix auth middleware blocking login page
├── Repair Playwright authenticated flows  
├── Ensure lint/test/build pipeline succeeds
├── Document environment variables and dependencies
└── Output: Stable baseline → All development agents

🗄️ Schema Architect Agent [ENHANCED - SUPABASE FOCUSED]  
├── Verify existing Supabase auth tables and RLS policies
├── Optimize invoice/dashboard data queries
├── Ensure real-time subscriptions for dashboard KPIs
├── Generate TypeScript types from current schema
└── Output: Optimized data layer → Feature enhancement agents
```

### **Development Layer - Feature Enhancement (Days 4-6)**
```
🎨 Design System Agent [EXISTING - ENHANCED]
├── Dashboard KPI layout polish and responsive charts
├── Invoice filters UI/UX improvements
├── Kanban drag-and-drop visual refinements
├── shadcn/ui theme consistency across pages
└── Output: Enhanced designs → Component implementations

🏗️ Component Architect Agent [EXISTING - INVOICE FOCUSED]
├── Dashboard KPI components with responsive breakpoints  
├── Advanced invoice filter components with state management
├── Kanban card components with accessibility support
├── CSV export UI components with progress feedback
└── Output: Component blueprints → Feature implementations

🚀 Feature Builder Agent [NEW - NEXT.JS 15 SPECIALIST]
├── Dashboard KPI accuracy improvements with Server Actions
├── Invoice advanced filters with optimistic updates
├── Kanban drag-and-drop with real-time sync via Supabase
├── CSV export functionality with streaming and progress
└── Output: Feature implementations → Testing and validation

🔌 API Integration Agent [ENHANCED - SUPABASE OPTIMIZED]
├── Dashboard KPI data fetching optimization with TanStack Query
├── Invoice filtering with efficient Supabase queries
├── Real-time kanban updates via Supabase subscriptions
├── CSV export data processing with memory optimization
└── Output: Optimized data layer → Quality validation
```

### **Quality & Deployment Layer - Production Ready (Days 6-8)**
```
🧪 Testing Agent [CRITICAL - PLAYWRIGHT FOCUS]
├── Fix existing Playwright login helper and auth flows
├── Create comprehensive E2E tests for invoice workflows
├── Dashboard KPI accuracy validation tests
├── Kanban drag-and-drop interaction tests
└── Output: Test coverage → Deployment readiness

♿ Accessibility Agent [EXISTING - INVOICE DASHBOARD FOCUS]
├── Dashboard charts accessibility (screen readers)
├── Invoice filters keyboard navigation support
├── Kanban drag-and-drop accessibility compliance
├── Color contrast validation across all components
└── Output: WCAG compliance → Client acceptance

⚡ Performance Agent [NEW - LIGHTHOUSE >90 TARGET]
├── Dashboard page Lighthouse optimization (target >90)
├── Invoice page load time optimization
├── Kanban drag-and-drop performance validation
├── Core Web Vitals monitoring setup
└── Output: Performance validation → Deployment approval

🚀 Deployment Agent [CRITICAL - VERCEL FOCUS]
├── Update vercel.json for auth middleware compatibility
├── Configure Supabase environment variables in Vercel
├── Manage preview deployments for stakeholder review
├── Production deployment with monitoring and rollback capability
└── Output: Live production deployment → Client sign-off
```

### **Cross-Cutting Agents - Continuous Operation**
```
📊 Observability Agent [VERCEL ANALYTICS INTEGRATION]  
├── Monitor build and deployment success rates
├── Track Core Web Vitals for dashboard performance
├── Error tracking for auth and data fetching issues
├── User interaction analytics for invoice workflows
└── Continuous monitoring throughout development

📚 Documentation Agent [CLIENT DELIVERABLE FOCUS]
├── Baseline audit documentation (deps, env vars, assumptions)
├── Feature enhancement acceptance criteria documentation
├── UAT checklist and stakeholder approval tracking  
├── Deployment playbook updates for client handover
└── Continuous documentation for client sign-off requirements
```

## Implementation Framework

### **Feature Tracking System - Aligned with Master Plan**
```typescript
interface InvoiceDashboardWorkflow {
  id: string              // "ID-001", "ID-002" (Invoice Dashboard prefix)
  masterPlanPhase: string // "Baseline" | "Enhancement" | "Deployment" | "Sign-off"
  clientPriority: 'Critical' | 'High' | 'Medium' | 'Low'
  timelineDay: number     // 1-8 day timeline alignment
  
  // Agent Progress Tracking
  agents: AgentStatus[]
  blockers: ProjectBlocker[]
  clientReviewStatus: 'Not Ready' | 'Ready for Review' | 'In Review' | 'Approved'
  
  // Master Plan Integration
  milestoneAlignment: MasterPlanMilestone
  riskMitigation: RiskMitigationPlan[]
  acceptanceCriteria: AcceptanceCriteria[]
}
```

### **Priority Workflows for Invoice Dashboard**

#### **Workflow ID-001: Authentication & Testing Stabilization (Days 1-2)**
```
CRITICAL BLOCKER RESOLUTION - 4-6 hours

Phase 1: Baseline Stabilization (Parallel - 2 hours)
├── 🔧 Baseline Stabilization Agent
│   ├── Fix middleware to allow `/auth/login` access
│   ├── Repair Playwright login helper selectors  
│   ├── Verify npm install/lint/test/build pipeline
│   └── Document current environment variable requirements
└── 🗄️ Schema Architect Agent
    ├── Audit existing Supabase auth tables and policies
    ├── Verify invoice/dashboard data queries
    └── Generate current TypeScript types

Phase 2: Testing Validation (Sequential - 2 hours)
├── 🧪 Testing Agent  
│   ├── Fix Playwright authenticated flow timeouts
│   ├── Ensure login form selectors work correctly
│   ├── Validate dashboard route protection
│   └── Create baseline test coverage report
└── 📚 Documentation Agent
    ├── Update docs/baseline-audit.md with findings
    ├── Document auth flow requirements
    └── Create environment setup guide

Success Criteria:
✅ `/auth/login` accessible and functional
✅ Playwright tests pass without timeouts
✅ lint/test/build pipeline succeeds
✅ Environment variables documented
✅ Ready for enhancement phase
```

#### **Workflow ID-002: Dashboard KPI Enhancement (Days 4-5)**
```
HIGH PRIORITY FEATURE - Target: 8-12 hours

Foundation (Parallel - 2 hours):
├── 🎨 Design System Agent
│   ├── Polish dashboard hero layout for mobile/desktop
│   ├── Enhance KPI card designs with data visualization
│   ├── Ensure responsive chart breakpoints
│   └── Create loading and error state designs
└── 🗄️ Schema Architect Agent
    ├── Optimize KPI data queries for performance
    ├── Setup real-time subscriptions for live data
    └── Ensure accurate data aggregation logic

Development (Sequential - 6 hours):
├── 🏗️ Component Architect Agent (2 hours)
│   ├── Build responsive KPI card components
│   ├── Create chart wrapper components with shadcn/ui
│   ├── Implement loading skeletons and error boundaries
│   └── Ensure accessibility for screen readers
├── 🚀 Feature Builder Agent (2 hours)
│   ├── Implement Server Actions for KPI data fetching
│   ├── Add real-time data updates with Supabase subscriptions
│   ├── Create optimistic updates for smooth UX
│   └── Implement error recovery and retry logic
└── 🔌 API Integration Agent (2 hours)
    ├── Optimize TanStack Query configuration for KPIs
    ├── Setup intelligent caching for dashboard data
    ├── Implement background refresh strategies
    └── Add error handling and offline support

Quality & Deployment (Parallel - 2 hours):
├── 🧪 Testing Agent → E2E tests for KPI accuracy and responsiveness
├── ♿ Accessibility Agent → Screen reader and keyboard navigation validation
├── ⚡ Performance Agent → Lighthouse score optimization (target >90)
└── 📚 Documentation Agent → Feature documentation and acceptance criteria

Client Deliverables:
├── ✅ Pixel parity across breakpoints (mobile, tablet, desktop)
├── ✅ Lighthouse score >90 for dashboard page
├── ✅ Real-time KPI updates working correctly
├── ✅ Comprehensive test coverage for KPI accuracy
└── ✅ Documentation ready for client review
```

#### **Workflow ID-003: Invoice Filters & CSV Export (Day 5-6)**
```
HIGH PRIORITY FEATURE - Target: 10-14 hours

Foundation (Parallel - 3 hours):
├── 🎨 Design System Agent
│   ├── Advanced filter UI/UX design with multiple criteria
│   ├── CSV export progress indicator and success states
│   ├── Filter tag display and removal interface
│   └── Mobile-responsive filter layout
└── 🗄️ Schema Architect Agent
    ├── Optimize invoice query performance with indexes
    ├── Create efficient filtering query patterns
    └── Design CSV export data transformation logic

Development (Sequential - 8 hours):
├── 🏗️ Component Architect Agent (3 hours)
│   ├── Advanced filter components (date range, status, amount)
│   ├── CSV export button with progress indicator
│   ├── Filter state management and persistence
│   └── Accessible form controls and keyboard navigation
├── 🚀 Feature Builder Agent (3 hours)
│   ├── Server Actions for advanced invoice filtering
│   ├── CSV export implementation with streaming
│   ├── Filter state synchronization with URL params
│   └── Optimistic updates for filter application
└── 🔌 API Integration Agent (2 hours)
    ├── TanStack Query integration for filtered data
    ├── CSV export progress tracking and cancellation
    ├── Memory-efficient large dataset handling
    └── Error recovery for failed exports

Quality & Deployment (Parallel - 3 hours):
├── 🧪 Testing Agent → Comprehensive filter and export testing
├── ♿ Accessibility Agent → Keyboard navigation and screen reader support
├── ⚡ Performance Agent → Large dataset export performance validation
└── 📚 Documentation Agent → User guide for filtering and export features

Client Deliverables:
├── ✅ Advanced filters covered by automated tests
├── ✅ CSV export functionality verified with large datasets
├── ✅ Filter persistence and URL state management
├── ✅ Mobile-responsive filter interface
└── ✅ Performance validation for 10k+ invoice exports
```

### **Quality Gates - Aligned with Client Expectations**
```typescript
interface ClientQualityGate {
  name: string
  masterPlanPhase: string
  clientReviewRequired: boolean
  acceptanceCriteria: AcceptanceCriteria[]
  automatedValidation: AutomatedCheck[]
  manualValidation: ManualCheck[]
}

const invoiceDashboardQualityGates: ClientQualityGate[] = [
  {
    name: "Baseline Stability Gate",
    masterPlanPhase: "Days 1-2",
    clientReviewRequired: false,
    acceptanceCriteria: [
      "Auth flow functional in all browsers",
      "Playwright tests pass consistently", 
      "Build pipeline succeeds",
      "Environment documented"
    ],
    automatedValidation: [
      "npm run test passes",
      "npm run build succeeds", 
      "Playwright auth tests green"
    ],
    manualValidation: [
      "Login flow tested in Chrome/Safari/Edge",
      "Dashboard routes protected correctly"
    ]
  },
  {
    name: "Feature Enhancement Gate", 
    masterPlanPhase: "Days 4-6",
    clientReviewRequired: true,
    acceptanceCriteria: [
      "Pixel parity across breakpoints",
      "Lighthouse >90 on all pages",
      "Advanced filters working correctly",
      "CSV export handles large datasets"
    ],
    automatedValidation: [
      "Lighthouse CI score >90",
      "E2E tests for all features pass",
      "Accessibility tests pass",
      "Performance benchmarks met"
    ],
    manualValidation: [
      "Client preview review approved",
      "UAT checklist completed",
      "Cross-browser testing verified"
    ]
  },
  {
    name: "Production Deployment Gate",
    masterPlanPhase: "Days 6-8", 
    clientReviewRequired: true,
    acceptanceCriteria: [
      "Preview deployment stable",
      "All integration tests pass",
      "Client sign-off obtained",
      "Production monitoring configured"
    ],
    automatedValidation: [
      "Preview deployment health checks pass",
      "Database migrations successful",
      "Environment variables configured",
      "Monitoring alerts configured"
    ],
    manualValidation: [
      "Client final approval obtained",
      "Deployment playbook verified",
      "Rollback procedure tested"
    ]
  }
]
```

## Immediate Implementation Tasks

### **Day 1 Priority (Start Here)**
```
CRITICAL: Baseline Stabilization

Task 1.1: Fix Authentication Flow (2 hours)
├── Analyze current middleware configuration
├── Identify why login page is blocked
├── Fix route protection to allow `/auth/login`
├── Verify dashboard routes remain protected

Task 1.2: Repair Playwright Tests (2 hours)  
├── Debug Playwright login helper timeout issues
├── Update form selectors for current login page
├── Ensure auth state persistence in tests
├── Validate E2E test coverage

Task 1.3: Environment Documentation (1 hour)
├── Audit all required environment variables
├── Document Supabase configuration requirements
├── Update baseline-audit.md with current state
├── Prepare for Vercel environment setup

SUCCESS CRITERIA:
✅ Login page accessible at /auth/login
✅ Playwright tests complete without timeouts
✅ Dashboard routes protected but accessible after auth
✅ npm run lint && npm run test && npm run build succeeds
✅ Environment variables documented for Vercel setup
```

### **Implementation Instructions for Codex**

**Start with this task in Codex GPT:**

1. **Analyze Current Codebase Structure**
   - Review middleware configuration causing login page blocking
   - Identify Playwright test selector issues
   - Audit current Supabase auth integration

2. **Implement Baseline Fixes**
   - Fix middleware to allow login page access
   - Update Playwright login helper with correct selectors  
   - Ensure build pipeline succeeds

3. **Setup Enhanced Orchestrator Framework**
   - Create feature tracking system with ID-001, ID-002 format
   - Implement agent coordination for upcoming enhancements
   - Setup quality gates aligned with client approval process

4. **Prepare for Feature Enhancement Phase**
   - Document current baseline state
   - Setup agent communication framework
   - Create feature enhancement blueprints for dashboard, invoices, and kanban pages

## Success Metrics - Client Deliverable Focus

### **Timeline Adherence**
- **Day 1-2**: Baseline stabilization complete ✅
- **Day 3**: Enhancement designs approved by client ✅
- **Day 4-6**: Feature implementations delivered ✅  
- **Day 6-8**: Production deployment with client sign-off ✅

### **Quality Standards**
- **Performance**: Lighthouse >90 on all pages
- **Testing**: >95% test coverage with Playwright E2E
- **Accessibility**: WCAG AA compliance validated
- **Client Approval**: UAT checklist completed and signed off

### **Technical Deliverables**
- **Dashboard**: KPI accuracy, responsive charts, real-time updates
- **Invoices**: Advanced filters, CSV export, optimized queries
- **Kanban**: Smooth drag-and-drop, accessibility support
- **Production**: Vercel deployment, monitoring, rollback capability

## Next Steps

**Copy this prompt into Codex GPT and start with:**

```
Based on my Master Plan and current project status, I need to immediately address the authentication flow issues blocking my invoice dashboard project.

Priority 1: Fix the middleware blocking /auth/login page access
Priority 2: Repair Playwright test timeouts in authentication flows  
Priority 3: Ensure lint/test/build pipeline succeeds consistently

My timeline is critical - I have 8 days to deliver this project with client sign-off. Please start with the baseline stabilization tasks and then help me implement the Enhanced Multi-Agent System for accelerated feature development.

Reference my Master Plan for context and use the existing agent specifications I've provided to enhance the current system.
```

**This will activate the Enhanced Multi-Agent System specifically tailored to your Invoice Dashboard project timeline and requirements, ensuring you meet your 8-day delivery commitment with zero bugs and client approval.**