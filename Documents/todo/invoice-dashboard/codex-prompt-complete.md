# Codex GPT Prompt: Enhanced Multi-Agent Dashboard Development System

## Project Context & Mission

You are the **Master Orchestrator Agent** for an advanced Next.js 15 dashboard development system with autonomous multi-agent workflows. 

**Current Tech Stack:**
- Next.js 15.5.2 with React 19.1, TypeScript 5, Turbopack
- Supabase (database, auth, real-time, storage) with @supabase/supabase-js & @supabase/ssr
- TanStack Query/Table/Virtual with Zod validation, date-fns
- shadcn/ui with Radix primitives, lucide icons, dnd-kit
- Playwright testing (@playwright/test), ESLint 9
- Vercel deployment with custom build commands
- Tailwind CSS 3.4

**Mission:** Create an autonomous feature development pipeline that delivers zero-bug deployments through intelligent agent coordination, comprehensive quality gates, and real-time monitoring.

## Enhanced Agent Ecosystem

### **Foundation Layer - Parallel Execution (3-5 min)**
```
🎨 Design System Agent [EXISTING]
├── Next.js 15 theme optimization, shadcn/ui token generation
├── Dark/light mode systems, responsive design patterns
├── Brand consistency, design token management
└── Output: Design tokens → Component Architect

🗄️ Schema Architect Agent [NEW - PRIORITY 1]
├── Supabase schema design, RLS automation, real-time setup
├── PostgreSQL optimization, migration management
├── TypeScript type generation, performance indexing
└── Output: Schema definitions → Feature Builder + API Integration
```

### **Development Layer - Sequential with Dependencies (8-12 min)**
```
🏗️ Component Architect Agent [EXISTING]
├── React 19 patterns, shadcn/ui optimization
├── Server/Client component balance, architectural patterns
├── Dependencies: Design System Agent
└── Output: Component blueprints → Feature Builder

🚀 Feature Builder Agent [NEW - PRIORITY 2]
├── Next.js 15 Server Actions, Streaming UI, optimistic updates
├── Partial Prerendering, App Router, Suspense patterns
├── Dependencies: Schema Architect + Component Architect
└── Output: Feature implementation → API Integration

🔌 API Integration Agent [ENHANCED]
├── TanStack Query optimization, Supabase real-time integration
├── Edge Function deployment, caching strategies
├── Dependencies: Schema Architect + Feature Builder
└── Output: API layer → Testing + Quality Agents
```

### **Quality & Deployment Layer - Parallel Validation (4-6 min)**
```
🧪 Testing Agent [EXISTING]
├── Playwright E2E automation, Supabase RLS testing
├── Component testing, performance benchmarking
├── Dependencies: All development agents complete

♿ Accessibility Agent [EXISTING]
├── WCAG 2.1 AA compliance, screen reader optimization
├── Keyboard navigation, color contrast validation
├── Dependencies: Component + Feature Builder agents

⚡ Performance Agent [NEW - PRIORITY 3]
├── Core Web Vitals optimization, Next.js 15 features
├── Bundle analysis, TanStack Query caching optimization
├── Dependencies: Feature Builder + API Integration

🔒 Security Agent [NEW]
├── RLS validation, vulnerability scanning, auth flow testing
├── Input sanitization, API security scanning
├── Dependencies: Schema Architect + API Integration

🚀 Deployment Agent [EXISTING]
├── Vercel optimization, CI/CD automation, monitoring setup
├── Environment management, rollback capabilities
├── Dependencies: All quality agents pass validation
```

### **Cross-Cutting Agents - Continuous Operation**
```
📊 Observability Agent [EXISTING]
├── Real-time monitoring, predictive analytics, error tracking
├── Performance metrics, user behavior tracking
├── Continuous operation during all workflows

📚 Documentation Agent [EXISTING]
├── Auto-generated docs, Storybook integration, ADRs
├── Component documentation, API specs, user guides
├── Parallel operation with most agents
```

## Implementation Objectives

### **Phase 1: Enhanced Orchestrator Implementation (Week 1-2)**

#### **1.1 Feature Tracking System**
Create a comprehensive tracking system with unique feature identifiers:

```typescript
interface FeatureWorkflow {
  id: string              // "FT-001", "FT-002", "FT-003"
  title: string           // "User Profile Management"
  description: string     // Detailed feature description
  status: WorkflowStatus  // "Planning" | "In Progress" | "Quality Review" | "Complete"
  currentPhase: WorkflowPhase // "Foundation" | "Development" | "Quality" | "Deployment"
  
  // Agent Progress Tracking
  agents: AgentStatus[]   // Real-time agent progress
  activeAgent?: string    // Currently executing agent
  
  // Timeline & Quality
  startTime: Date
  estimatedCompletion: Date
  qualityGates: QualityGateStatus[]
  overallQualityScore: number
}

interface AgentStatus {
  id: string              // "schema-architect", "feature-builder"
  name: string           // "Schema Architect Agent"
  status: AgentState     // "Queued" | "Active" | "Complete" | "Error" | "Waiting"
  progress: number       // 0-100 percentage
  duration: number       // Time spent in milliseconds
  outputs: string[]      // Generated artifacts
  dependencies: string[] // Required agent completions
  nextAgent?: string     // Handoff target
}
```

#### **1.2 Agent Handoff System**
Implement standardized handoff points with validation:

```typescript
// Foundation Layer Handoffs
interface DesignHandoff {
  designTokens: DesignTokenSet      // Colors, typography, spacing
  themeConfiguration: ThemeConfig   // Light/dark mode, brand themes
  componentPatterns: ComponentPattern[] // Standard UI patterns
  brandGuidelines: BrandGuideline[] // Usage rules and constraints
}

interface SchemaHandoff {
  databaseSchema: PostgreSQLSchema  // Tables, relationships, indexes
  rlsPolicies: RLSPolicy[]         // Row Level Security policies
  realtimeConfig: RealtimeConfig   // Subscription setup
  typeDefinitions: TypeScriptTypes // Auto-generated types
  migrationScripts: MigrationScript[] // Database migration files
}

// Development Layer Handoffs
interface ComponentHandoff {
  componentBlueprints: ComponentBlueprint[] // Component architecture
  designPatterns: ArchitecturalPattern[]    // Reusable patterns
  validationSchemas: ZodSchema[]            // Form validation rules
  testingTemplates: TestTemplate[]          // Component test patterns
}

interface FeatureHandoff {
  serverActions: ServerAction[]           // Next.js Server Actions
  clientComponents: ClientComponent[]     // Interactive UI components
  streamingConfig: StreamingConfig        // Suspense boundaries
  optimisticUpdates: OptimisticPattern[]  // UX enhancement patterns
  errorBoundaries: ErrorBoundary[]        // Error handling components
}
```

#### **1.3 Quality Gate System**
Implement comprehensive quality validation with pass/fail criteria:

```typescript
interface QualityGate {
  name: string
  phase: WorkflowPhase
  criteria: QualityCriteria[]
  threshold: number        // Pass threshold (0-100)
  canBypass: boolean      // Emergency bypass allowed
  validators: AgentType[] // Required agent validations
}

const qualityGates: QualityGate[] = [
  {
    name: "Foundation Review",
    phase: "Foundation",
    criteria: ["Design tokens valid", "Schema approved", "Types generated"],
    threshold: 95,
    canBypass: false,
    validators: ["design-system", "schema-architect"]
  },
  {
    name: "Development Review",
    phase: "Development", 
    criteria: ["Components tested", "Features implemented", "APIs integrated"],
    threshold: 90,
    canBypass: false,
    validators: ["component-architect", "feature-builder", "api-integration"]
  },
  {
    name: "Quality Review",
    phase: "Quality",
    criteria: ["Tests pass", "A11y compliant", "Performance met", "Security validated"],
    threshold: 85,
    canBypass: true, // Emergency hotfixes only
    validators: ["testing", "accessibility", "performance", "security"]
  },
  {
    name: "Deployment Ready",
    phase: "Deployment",
    criteria: ["All validations passed", "Documentation complete"],
    threshold: 95,
    canBypass: false,
    validators: ["deployment", "documentation"]
  }
]
```

### **Phase 2: Priority Agent Development (Week 3-4)**

#### **2.1 Schema Architect Agent - Supabase Specialist**
Build a dedicated Supabase expert with these capabilities:

```typescript
class SchemaArchitectAgent extends BaseAgent {
  async designSchema(requirements: FeatureRequirement[]): Promise<SchemaDesign> {
    // Generate optimized PostgreSQL schema
    const schema = await this.generateSchema(requirements)
    
    // Create RLS policies automatically
    const rlsPolicies = await this.generateRLSPolicies(schema)
    
    // Setup real-time subscriptions
    const realtimeConfig = await this.setupRealtime(schema)
    
    // Generate TypeScript types
    const types = await this.generateTypes(schema)
    
    return { schema, rlsPolicies, realtimeConfig, types }
  }

  async generateRLSPolicies(schema: PostgreSQLSchema): Promise<RLSPolicy[]> {
    // Auto-generate Row Level Security policies
    // Example: Multi-tenant access patterns, user-scoped data, team-based access
    return [
      {
        table: 'user_profiles',
        policy: 'users_own_data',
        rule: 'auth.uid() = user_id'
      },
      {
        table: 'team_resources',
        policy: 'team_members_access',
        rule: 'EXISTS (SELECT 1 FROM team_memberships WHERE team_id = team_resources.team_id AND user_id = auth.uid())'
      }
    ]
  }
}
```

#### **2.2 Feature Builder Agent - Next.js 15 Specialist**
Create a Next.js 15 expert with React 19 integration:

```typescript
class FeatureBuilderAgent extends BaseAgent {
  async buildFeature(spec: FeatureSpec): Promise<FeatureImplementation> {
    // Generate Server Actions with type safety
    const serverActions = await this.generateServerActions(spec)
    
    // Create streaming UI with Suspense
    const streamingComponents = await this.generateStreamingUI(spec)
    
    // Implement optimistic updates
    const optimisticPatterns = await this.generateOptimisticUpdates(spec)
    
    return { serverActions, streamingComponents, optimisticPatterns }
  }

  async generateServerActions(spec: FeatureSpec): Promise<ServerAction[]> {
    // Create type-safe Server Actions with validation
    return [
      {
        name: 'createUserProfile',
        implementation: `
          'use server'
          
          import { z } from 'zod'
          import { createClient } from '@/lib/supabase/server'
          import { revalidatePath } from 'next/cache'
          
          const CreateProfileSchema = z.object({
            display_name: z.string().min(1).max(100),
            bio: z.string().max(500).optional()
          })
          
          export async function createUserProfile(
            prevState: ActionState,
            formData: FormData
          ): Promise<ActionState> {
            const validatedFields = CreateProfileSchema.safeParse({
              display_name: formData.get('display_name'),
              bio: formData.get('bio')
            })
            
            if (!validatedFields.success) {
              return { fieldErrors: validatedFields.error.flatten().fieldErrors }
            }
            
            // Get authenticated user
            const supabase = createClient()
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
              return { error: 'Authentication required' }
            }
            
            // Supabase integration with RLS
            const { error } = await supabase
              .from('user_profiles')
              .insert({
                ...validatedFields.data,
                user_id: user.id
              })
            
            if (error) return { error: 'Failed to create profile' }
            
            revalidatePath('/profile')
            return { success: true }
          }
        `
      }
    ]
  }

  async generateStreamingUI(spec: FeatureSpec): Promise<StreamingComponent[]> {
    // Create components with Suspense boundaries for progressive loading
    return [
      {
        name: 'UserProfileDashboard',
        implementation: `
          import { Suspense } from 'react'
          import { ProfileHeader } from './components/profile-header'
          import { ProfileSettings } from './components/profile-settings'
          import { ActivityFeed } from './components/activity-feed'
          
          export default function UserProfileDashboard() {
            return (
              <div className="profile-dashboard">
                {/* Critical above-the-fold content loads immediately */}
                <div className="profile-header">
                  <Suspense fallback={<ProfileHeaderSkeleton />}>
                    <ProfileHeader />
                  </Suspense>
                </div>
          
                {/* Secondary content streams in progressively */}
                <div className="profile-content">
                  <Suspense fallback={<SettingsSkeleton />}>
                    <ProfileSettings />
                  </Suspense>
                  
                  <Suspense fallback={<ActivitySkeleton />}>
                    <ActivityFeed />
                  </Suspense>
                </div>
              </div>
            )
          }
        `
      }
    ]
  }
}
```

#### **2.3 Performance Agent - Core Web Vitals Specialist**
Build a performance optimization expert:

```typescript
class PerformanceAgent extends BaseAgent {
  async optimizePerformance(application: ApplicationSpec): Promise<PerformanceOptimization> {
    // Analyze bundle size and identify optimization opportunities
    const bundleAnalysis = await this.analyzeBundleSize(application)
    
    // Optimize TanStack Query configuration
    const queryOptimization = await this.optimizeTanStackQuery(application)
    
    // Implement Next.js 15 performance features
    const nextjsOptimization = await this.optimizeNextJS15(application)
    
    return {
      bundleOptimizations: bundleAnalysis.optimizations,
      queryOptimizations: queryOptimization,
      nextjsOptimizations: nextjsOptimization,
      coreWebVitalsTarget: {
        LCP: 1500, // ms - Largest Contentful Paint
        FID: 50,   // ms - First Input Delay
        CLS: 0.1   // score - Cumulative Layout Shift
      }
    }
  }

  async optimizeTanStackQuery(application: ApplicationSpec): Promise<QueryOptimization> {
    return {
      caching: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false
      },
      prefetching: {
        enabled: true,
        strategy: 'intelligent', // Prefetch based on user behavior
        routes: ['/', '/dashboard', '/profile']
      },
      optimisticUpdates: {
        enabled: true,
        rollbackOnError: true,
        conflictResolution: 'server-wins'
      }
    }
  }
}
```

### **Phase 3: Workflow Patterns (Week 5-6)**

#### **Pattern A: Full Feature Development (15-25 minutes)**
```
Input: "Create real-time notification system with toast display"

Foundation Phase (Parallel - 4 minutes):
├── 🎨 Design System Agent
│   ├── Create notification color tokens
│   ├── Design toast component variants (success, error, warning, info)
│   ├── Establish animation patterns (slide-in, fade-out)
│   └── Setup responsive breakpoint behaviors
└── 🗄️ Schema Architect Agent
    ├── Design notifications table schema
    │   ├── id (uuid, primary key)
    │   ├── user_id (uuid, foreign key to auth.users)
    │   ├── title (text)
    │   ├── message (text)
    │   ├── type (enum: success, error, warning, info)
    │   ├── read_at (timestamp, nullable)
    │   └── created_at (timestamp with timezone)
    ├── Create RLS policies for user notifications
    │   └── Policy: Users can only access their own notifications
    ├── Setup real-time subscription triggers
    │   └── Trigger: Notify on INSERT for user-specific notifications
    └── Generate TypeScript types from schema

Development Phase (Sequential - 10 minutes):
├── 🏗️ Component Architect Agent (3 minutes)
│   ├── Build Toast component with shadcn/ui
│   │   ├── ToastProvider context for global state
│   │   ├── Toast component with variants and animations
│   │   └── ToastQueue for managing multiple toasts
│   ├── Create NotificationCenter component
│   │   ├── Dropdown/modal for viewing all notifications
│   │   ├── Mark as read functionality
│   │   └── Infinite scrolling for pagination
│   └── Implement dismissal and queue logic
│       ├── Auto-dismiss after 5 seconds (configurable)
│       ├── Manual dismiss with close button
│       └── Queue management (max 3 visible at once)
├── 🚀 Feature Builder Agent (4 minutes)
│   ├── Implement Server Actions for notifications
│   │   ├── createNotification(userId, title, message, type)
│   │   ├── markAsRead(notificationId)
│   │   └── getNotifications(userId, page, limit)
│   ├── Create notification management hooks
│   │   ├── useNotifications() - fetch and manage notification state
│   │   ├── useToast() - show toast notifications
│   │   └── useNotificationSubscription() - real-time updates
│   ├── Add real-time subscription logic
│   │   ├── Subscribe to user-specific notification channel
│   │   ├── Handle incoming notifications with optimistic updates
│   │   └── Auto-show toast for new notifications
│   └── Implement optimistic updates for smooth UX
│       ├── Optimistically mark as read
│       ├── Optimistically add new notifications
│       └── Rollback on error with user feedback
└── 🔌 API Integration Agent (3 minutes)
    ├── Setup TanStack Query for notification fetching
    │   ├── useInfiniteQuery for paginated notifications
    │   ├── Smart caching with 5-minute stale time
    │   └── Background refetch on window focus
    ├── Implement optimistic updates with TanStack Query
    │   ├── Optimistic mark as read mutations
    │   ├── Optimistic notification creation
    │   └── Error boundary handling with rollback
    └── Configure Supabase real-time channels
        ├── Subscribe to 'notifications:{userId}' channel
        ├── Handle INSERT events for new notifications
        └── Handle UPDATE events for read status changes

Quality Phase (Parallel - 5 minutes):
├── 🧪 Testing Agent (2 minutes)
│   ├── E2E notification flow tests
│   │   ├── Test notification creation and display
│   │   ├── Test real-time notification reception
│   │   ├── Test mark as read functionality
│   │   └── Test toast dismissal behaviors
│   ├── Unit tests for notification hooks
│   │   ├── Test useNotifications hook state management
│   │   ├── Test useToast hook queue management
│   │   └── Test error handling and rollback
│   └── Integration tests for Server Actions
│       ├── Test notification CRUD operations
│       ├── Test RLS policy enforcement
│       └── Test real-time subscription behavior
├── ♿ Accessibility Agent (1 minute)
│   ├── Screen reader announcements for new notifications
│   │   ├── Use aria-live="polite" for toast announcements
│   │   ├── Descriptive aria-labels for notification actions
│   │   └── Screen reader friendly notification summaries
│   ├── Keyboard navigation support
│   │   ├── Tab navigation through notification list
│   │   ├── Enter/Space to mark as read
│   │   └── Escape key to dismiss toasts
│   └── High contrast mode compatibility
│       ├── Ensure color-blind friendly notification types
│       ├── Sufficient contrast ratios (4.5:1 minimum)
│       └── Focus indicators for keyboard users
├── ⚡ Performance Agent (1 minute)
│   ├── Real-time subscription performance validation
│   │   ├── Monitor WebSocket connection stability
│   │   ├── Test notification delivery latency (<100ms)
│   │   └── Validate subscription cleanup on unmount
│   ├── Toast animation performance
│   │   ├── Use CSS transforms for 60fps animations
│   │   ├── Minimize layout thrashing
│   │   └── Test performance on mobile devices
│   └── Bundle size impact analysis
│       ├── Ensure notification features <10KB gzipped
│       ├── Code splitting for NotificationCenter
│       └── Lazy loading for non-critical notification features
└── 🔒 Security Agent (1 minute)
    ├── RLS policy validation
    │   ├── Test users cannot access other users' notifications
    │   ├── Validate notification creation requires authentication
    │   └── Test notification modification permissions
    ├── Real-time channel security
    │   ├── Ensure channel subscriptions are user-scoped
    │   ├── Validate JWT token in subscription authorization
    │   └── Test for unauthorized channel access attempts
    └── Input sanitization validation
        ├── Test XSS prevention in notification content
        ├── Validate HTML sanitization in notification messages
        └── Test SQL injection prevention in notification queries

Deployment Phase (3 minutes):
└── 🚀 Deployment Agent
    ├── Update Vercel deployment configuration
    │   ├── Environment variables for Supabase real-time
    │   ├── Edge function deployment for notification triggers
    │   └── CDN optimization for notification assets
    ├── Deploy database migrations to staging
    │   ├── Create notifications table with proper indexes
    │   ├── Deploy RLS policies with validation
    │   └── Setup real-time triggers and functions
    ├── Run smoke tests on staging environment
    │   ├── Test notification creation and delivery
    │   ├── Validate real-time subscription functionality
    │   └── Test performance under load (100 concurrent users)
    └── Deploy to production with monitoring
        ├── Blue-green deployment strategy
        ├── Real-time monitoring of notification delivery rates
        └── Automatic rollback triggers on error rate >1%

Documentation (Continuous - runs parallel):
└── 📚 Documentation Agent
    ├── Auto-generated component documentation
    │   ├── Toast component prop tables and examples
    │   ├── NotificationCenter usage patterns
    │   └── Hook documentation with code examples
    ├── API specification updates
    │   ├── OpenAPI specs for notification endpoints
    │   ├── Real-time event documentation
    │   └── Error response specifications
    ├── Architecture decision records
    │   ├── Notification system design rationale
    │   ├── Real-time vs polling trade-off analysis
    │   └── Toast UX pattern justification
    └── User guide creation
        ├── How to implement notifications in new features
        ├── Customization guide for toast appearance
        └── Troubleshooting common notification issues

Expected Output:
├── ✅ Real-time notification system with toast display
├── ✅ NotificationCenter with infinite scroll and mark-as-read
├── ✅ Type-safe Server Actions with proper validation
├── ✅ Optimistic updates with error handling
├── ✅ WCAG AA compliant with full keyboard support
├── ✅ <100ms notification delivery latency
├── ✅ Zero security vulnerabilities
└── ✅ Complete documentation and test coverage
```

#### **Pattern B: Performance Emergency Response (8-12 minutes)**
```
Alert: "Dashboard loading >3s, Core Web Vitals failing"

Emergency Analysis (1 minute):
└── ⚡ Performance Agent → Immediate bottleneck identification
    ├── Bundle size analysis (identifies +40% growth)
    ├── Network waterfall analysis (finds unoptimized images)
    ├── TanStack Query cache analysis (discovers cache misses)
    └── Supabase query analysis (detects N+1 problems)

Parallel Emergency Fixes (6 minutes):
├── 🏗️ Component Architect Agent (2 minutes)
│   ├── Implement code splitting at route level
│   │   ├── Convert heavy components to React.lazy()
│   │   ├── Split dashboard modules into separate chunks
│   │   └── Add loading boundaries for async components
│   ├── Add React.memo for expensive re-renders
│   │   ├── Memoize dashboard metric components
│   │   ├── Optimize prop comparison functions
│   │   └── Prevent unnecessary chart re-renders
│   └── Move client-side code to separate chunks
│       ├── Extract chart libraries to separate bundle
│       ├── Lazy load interactive components
│       └── Defer non-critical JavaScript execution
├── 🚀 Feature Builder Agent (2 minutes)
│   ├── Implement streaming UI with Suspense
│   │   ├── Add Suspense boundaries around slow components
│   │   ├── Create skeleton loading states
│   │   └── Progressive content loading for dashboard widgets
│   ├── Add strategic caching layers
│   │   ├── Implement request deduplication
│   │   ├── Add component-level caching
│   │   └── Cache expensive calculations
│   └── Optimize Server Actions
│       ├── Reduce payload sizes
│       ├── Implement response streaming
│       └── Add request batching
└── 🔌 API Integration Agent (2 minutes)
    ├── Fix N+1 queries with batch loading
    │   ├── Implement DataLoader pattern for related data
    │   ├── Batch multiple API requests into single calls
    │   └── Use Supabase's batch query capabilities
    ├── Add TanStack Query prefetching
    │   ├── Prefetch critical dashboard data on route change
    │   ├── Background refresh stale data
    │   └── Implement intelligent prefetching based on user behavior
    └── Implement strategic caching layers
        ├── Add request-level caching with React Query
        ├── Implement CDN caching for static dashboard data
        └── Use Supabase cache headers for API responses

Validation & Fast-Track Deployment (3 minutes):
├── ⚡ Performance Agent (1 minute)
│   ├── Validate Core Web Vitals improvements
│   │   ├── LCP improved from 4.2s to 1.4s ✅
│   │   ├── FID reduced from 180ms to 45ms ✅
│   │   └── CLS improved from 0.3 to 0.08 ✅
│   ├── Bundle size analysis
│   │   ├── Main bundle reduced by 35% ✅
│   │   ├── Code splitting working correctly ✅
│   │   └── Lazy loading functioning properly ✅
│   └── Cache hit rate validation
│       ├── TanStack Query cache hit rate >85% ✅
│       ├── Supabase response caching working ✅
│       └── CDN cache hit rate >90% ✅
├── 🧪 Testing Agent (1 minute)
│   ├── Performance regression tests
│   │   ├── Lighthouse CI scores >90 across all metrics ✅
│   │   ├── Load testing with 1000 concurrent users ✅
│   │   └── Mobile performance validation ✅
│   ├── Functional regression tests
│   │   ├── Critical user flows still working ✅
│   │   ├── Dashboard data accuracy maintained ✅
│   │   └── User authentication flows functional ✅
│   └── Error boundary tests
│       ├── Graceful degradation on slow connections ✅
│       ├── Error recovery mechanisms working ✅
│       └── Loading states displaying correctly ✅
└── 🚀 Deployment Agent (1 minute)
    ├── Fast-track deployment to staging
    │   ├── Skip non-critical validation steps
    │   ├── Deploy performance optimizations first
    │   └── Monitor key metrics during deployment
    ├── Validate performance improvements in staging
    │   ├── Real user monitoring shows improvements ✅
    │   ├── Error rates remain stable ✅
    │   └── User satisfaction metrics improved ✅
    └── Deploy to production with enhanced monitoring
        ├── Canary deployment to 10% of users
        ├── Real-time Core Web Vitals monitoring
        └── Automatic rollback if performance degrades

Result Metrics:
├── 🎯 Load Time: 67% improvement (4.2s → 1.4s)
├── 📊 Core Web Vitals: All green (LCP: 1.4s, FID: 45ms, CLS: 0.08)
├── 📦 Bundle Size: 35% reduction in main bundle
├── ⚡ Cache Hit Rate: 89% average across all caching layers
├── 👥 User Satisfaction: 23% improvement in task completion time
└── 🚀 Deployment: Zero downtime, 5-minute total resolution time
```

## Implementation Tasks

### **Week 1: Core Infrastructure**
1. **Enhanced Orchestrator Setup**
   - Create feature tracking system with unique IDs (FT-001, FT-002, etc.)
   - Implement real-time agent status monitoring dashboard
   - Build quality gate validation system with pass/fail criteria
   - Setup workflow pattern templates (Full Feature, Emergency Response, etc.)
   - Create shared context management for agent communication

2. **Agent Communication Framework**
   - Create standardized handoff interfaces with TypeScript types
   - Implement artifact validation system with comprehensive checks
   - Build shared context management with conflict resolution
   - Setup error recovery mechanisms with automatic rollback
   - Create real-time workflow visualization dashboard

### **Week 2: Foundation Agents**
1. **Schema Architect Agent Implementation**
   - Supabase schema design automation with PostgreSQL best practices
   - RLS policy generation with multi-tenant security patterns
   - Real-time subscription optimization with efficient filtering
   - TypeScript type generation from schema with full coverage
   - Migration script automation with backwards compatibility

2. **Enhanced Orchestrator Testing**
   - Workflow pattern validation with comprehensive test scenarios
   - Quality gate enforcement testing with edge cases
   - Agent handoff verification with artifact validation
   - Performance benchmark establishment with SLA targets
   - Error recovery testing with chaos engineering approaches

### **Week 3: Development Agents**
1. **Feature Builder Agent Implementation**
   - Next.js 15 Server Actions with comprehensive type safety
   - Streaming UI with Suspense boundaries and progressive loading
   - Optimistic updates for smooth UX with rollback capabilities
   - Progressive enhancement patterns for accessibility and performance
   - React 19 concurrent features integration

2. **API Integration Enhancement**
   - TanStack Query optimization patterns with intelligent caching
   - Supabase real-time integration with efficient subscriptions
   - Caching strategy implementation with multi-layer approach
   - Error boundary patterns with graceful degradation
   - Edge Function integration for serverless optimizations

### **Week 4: Quality & Performance**
1. **Performance Agent Implementation**
   - Core Web Vitals monitoring and optimization with real-time alerts
   - Bundle size analysis and code splitting automation
   - TanStack Query performance tuning with cache optimization
   - Next.js 15 feature optimization (PPR, Streaming, Server Actions)
   - Mobile performance optimization with responsive loading strategies

2. **Security Agent Implementation**
   - RLS policy validation and testing with comprehensive coverage
   - API security scanning with automated vulnerability detection
   - Authentication flow verification with edge case testing
   - Input sanitization validation with XSS/injection prevention
   - OWASP compliance checking with automated reporting

## Success Metrics & KPIs

### **Development Velocity**
- **Feature Development Speed**: 70% reduction (25 min → 7.5 min average)
- **Bug Fix Resolution**: 85% reduction (2 hours → 18 minutes)
- **Code Review Cycles**: 60% reduction (3 cycles → 1.2 cycles)
- **Deployment Frequency**: 10x increase (weekly → daily)
- **Developer Productivity**: 3x improvement in features delivered per sprint

### **Quality Improvements**
- **Production Bugs**: 95% reduction (20/month → 1/month)
- **Performance Scores**: 100% pages >90 Core Web Vitals
- **Accessibility Compliance**: 100% WCAG AA compliance
- **Security Vulnerabilities**: Zero critical issues, <5 low-risk issues per month
- **Test Coverage**: >95% code coverage across all components

### **Operational Excellence**
- **Mean Time to Recovery**: <5 minutes (was 2 hours)
- **Deployment Success Rate**: 99.9% (was 94%)
- **Developer Satisfaction**: 90%+ team satisfaction
- **Operational Overhead**: 80% reduction in manual tasks
- **Infrastructure Costs**: 30% reduction through optimization

## Expected Workflow Output

### **Real-Time Monitoring Dashboard**
```
🎯 ACTIVE WORKFLOW: FT-003 - User Profile Management
Status: Phase 2 - Development (67% complete)
Started: 14:32 AEST | ETA: 14:52 AEST (13 minutes remaining)
Quality Score Prediction: 94% (Excellent)

Foundation Phase ✅ COMPLETE (4m 23s)
├── 🎨 Design System Agent     ✅ Design tokens created, theme optimized
│   └── Artifacts: profile-tokens.json, avatar-styles.css, theme-config.ts
└── 🗄️ Schema Architect Agent ✅ User profiles schema, RLS policies deployed
    └── Artifacts: 001_user_profiles.sql, rls_policies.sql, types.ts

Development Phase ⚡ ACTIVE (8m 31s elapsed)
├── 🏗️ Component Architect     ✅ Profile components ready (5m 30s)
│   └── Artifacts: ProfileForm.tsx, AvatarUpload.tsx, validation-schemas.ts
├── 🚀 Feature Builder         🔄 Server Actions implementation (3m 20s) - 85% complete
│   ├── ✅ createUserProfile action complete
│   ├── ✅ updateUserProfile action complete  
│   ├── 🔄 uploadAvatar action in progress
│   └── 📋 optimistic update patterns queued
└── 🔌 API Integration         ⏳ Waiting for Feature Builder handoff (0m)
    └── Ready to start TanStack Query setup and Supabase integration

Quality Phase 📋 QUEUED - Waiting for Development completion
├── 🧪 Testing Agent           ⏳ E2E tests, unit tests, RLS testing ready to start
├── ♿ Accessibility Agent     ⏳ WCAG compliance validation ready to start  
├── ⚡ Performance Agent       ⏳ Core Web Vitals optimization ready to start
└── 🔒 Security Agent          ⏳ RLS validation, security scan ready to start

Deployment Phase 📋 QUEUED - Waiting for Quality gate approval
└── 🚀 Deployment Agent        ⏳ Vercel deployment pipeline ready

Cross-Cutting Agents (Continuous Operation)
├── 📚 Documentation Agent     ⚡ ACTIVE (2m 15s) - 45% complete
│   ├── ✅ Component documentation drafted
│   ├── 🔄 API specifications in progress
│   ├── 📋 User guides queued
│   └── 📋 Storybook stories queued
└── 📊 Observability Agent     ⚡ MONITORING all agent activities
    ├── Real-time performance metrics: Normal
    ├── Error rate: 0% (0 errors in last 10 minutes)
    └── Resource usage: 23% CPU, 156MB memory

🔄 HANDOFF STATUS:
├── Design System → Component Architect    ✅ Complete (Design tokens transferred)
├── Schema Architect → Component Architect ✅ Complete (Schema definitions transferred)
├── Component Architect → Feature Builder  ✅ Complete (Component blueprints transferred)  
├── Feature Builder → API Integration      ⏳ Pending (Feature implementation 85% complete)
└── API Integration → Quality Agents       📋 Queued (Waiting for API integration)

🚦 QUALITY GATES:
├── Foundation Review    ✅ PASSED (100% - Design tokens ✅, Schema approved ✅, Types generated ✅)
├── Development Review   🔄 IN PROGRESS (78% - Components ✅, Features 85%, APIs pending)
├── Quality Review       📋 PENDING (Tests ⏳, A11y ⏳, Performance ⏳, Security ⏳)
└── Deployment Ready     📋 PENDING (All validations required)

🎯 NEXT MILESTONE: Feature Builder completion → API Integration handoff
🚨 ALERTS: None - All systems operating normally
📈 TREND: On track for 20-minute completion (5 minutes ahead of schedule)
```

### **Agent Performance Metrics**
```
📊 AGENT PERFORMANCE DASHBOARD (Last 7 days)

🏆 TOP PERFORMING AGENTS:
1. 🗄️ Schema Architect Agent    - 99.2% success rate, avg 3.8min completion
2. 🎨 Design System Agent       - 98.9% success rate, avg 2.1min completion  
3. 🏗️ Component Architect Agent - 97.5% success rate, avg 4.2min completion

⚠️ IMPROVEMENT OPPORTUNITIES:
1. 🔒 Security Agent           - 94.1% success rate (target: 98%+)
2. ⚡ Performance Agent        - 95.3% success rate (target: 98%+)

📈 VELOCITY TRENDS:
├── Average feature completion: 18.3 minutes (down from 23.7 last week)
├── Quality gate pass rate: 96.8% (up from 92.1% last week)
├── Emergency response time: 8.2 minutes (down from 12.5 last week)
└── Developer satisfaction: 94% (up from 87% last week)

🎯 WEEKLY GOALS:
├── Reduce average feature completion to <15 minutes
├── Achieve 98%+ quality gate pass rate
├── Maintain zero critical production bugs
└── Increase developer satisfaction to 95%+
```

## Getting Started

### **Immediate Next Steps**
1. **Copy this entire prompt** and paste it into Codex GPT
2. **Ask Codex to begin with Phase 1**: "Start implementing the Enhanced Orchestrator with feature tracking system"
3. **Reference your existing agents** by mentioning the attached agent files for context
4. **Request specific implementations** like "Create the FeatureWorkflow TypeScript interface" or "Implement the Quality Gate validation system"

### **First Implementation Request**
```
Based on this prompt, please start implementing the Enhanced Orchestrator system for my Next.js 15 dashboard. 

Begin with:
1. Create the feature tracking system with FT-001 numbering
2. Implement the AgentStatus interface and real-time monitoring
3. Build the quality gate validation system
4. Setup the agent handoff framework

Use my existing tech stack (Next.js 15.5.2, Supabase, TanStack Query, shadcn/ui, Vercel) and reference the attached agent files for context on my current system.

Priority focus: Get the core orchestrator working first, then we'll add the specialized agents (Schema Architect, Feature Builder, Performance Agent) in subsequent iterations.
```

**This comprehensive system will transform your development workflow into an autonomous, intelligent pipeline that delivers features 10x faster with zero bugs reaching production.**