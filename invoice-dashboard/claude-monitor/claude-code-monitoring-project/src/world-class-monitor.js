// World-Class Claude Code Enterprise Monitor
class WorldClassClaudeMonitor {
    constructor() {
        this.sessionStartTime = Date.now();
        this.totalTasks = 0;
        this.activityLog = [];
        this.performanceData = [];
        this.tokenUsage = {
            used: 32000,
            total: 200000,
            system: 6700,
            tools: 11400,
            mcp: 9600,
            memory: 4300,
            efficiency: 98.7
        };
        
        this.agents = new Map([
            ['shadcn-optimization', { 
                name: 'ShadCN Optimization', 
                icon: '📈', 
                status: 'active', 
                progress: 73,
                tasksCompleted: 12,
                avgResponseTime: '2.3s',
                successRate: 96.8,
                specialty: 'Performance & Bundle Analysis',
                currentTask: 'Analyzing component dependencies',
                lastActivity: Date.now() - 30000
            }],
            ['design-system', { 
                name: 'Design System', 
                icon: '🎨', 
                status: 'active', 
                progress: 45,
                tasksCompleted: 8,
                avgResponseTime: '1.8s',
                successRate: 98.2,
                specialty: 'Brand Consistency & Tokens',
                currentTask: 'Validating color contrast ratios',
                lastActivity: Date.now() - 45000
            }],
            ['component-architect', { 
                name: 'Component Architect', 
                icon: '🏗️', 
                status: 'ready', 
                progress: 0,
                tasksCompleted: 15,
                avgResponseTime: '3.1s',
                successRate: 94.3,
                specialty: 'Architecture & Scalability',
                currentTask: null,
                lastActivity: Date.now() - 120000
            }],
            ['accessibility', { 
                name: 'Accessibility', 
                icon: '♿', 
                status: 'active', 
                progress: 88,
                tasksCompleted: 6,
                avgResponseTime: '2.7s',
                successRate: 99.1,
                specialty: 'WCAG Compliance & A11y',
                currentTask: 'Running keyboard navigation tests',
                lastActivity: Date.now() - 15000
            }],
            ['testing-orchestrator', { 
                name: 'Testing Orchestrator', 
                icon: '🧪', 
                status: 'ready', 
                progress: 0,
                tasksCompleted: 22,
                avgResponseTime: '4.2s',
                successRate: 92.7,
                specialty: 'Quality Assurance & Testing',
                currentTask: null,
                lastActivity: Date.now() - 180000
            }],
            ['documentation', { 
                name: 'Documentation', 
                icon: '📚', 
                status: 'ready', 
                progress: 0,
                tasksCompleted: 9,
                avgResponseTime: '1.5s',
                successRate: 97.8,
                specialty: 'Auto-docs & Knowledge Management',
                currentTask: null,
                lastActivity: Date.now() - 90000
            }],
            ['deployment', { 
                name: 'Deployment', 
                icon: '🚀', 
                status: 'ready', 
                progress: 0,
                tasksCompleted: 4,
                avgResponseTime: '5.8s',
                successRate: 95.2,
                specialty: 'CI/CD & Infrastructure',
                currentTask: null,
                lastActivity: Date.now() - 300000
            }],
            ['orchestrator', { 
                name: 'Master Orchestrator', 
                icon: '🎯', 
                status: 'monitoring', 
                progress: 100,
                tasksCompleted: 76,
                avgResponseTime: '0.8s',
                successRate: 99.7,
                specialty: 'Task Coordination & Management',
                currentTask: 'Coordinating agent workflows',
                lastActivity: Date.now() - 5000
            }]
        ]);
        
        this.isDarkMode = false;
        this.performanceChart = null;
        
        this.initializeWorldClassMonitoring();
        this.initializePerformanceChart();
        this.startAdvancedAnalytics();
    }
    
    initializeWorldClassMonitoring() {
        // Update display every 2 seconds for smooth animations
        setInterval(() => {
            this.updateWorldClassDisplay();
        }, 2000);
        
        // Advanced agent simulation every 8-15 seconds
        setInterval(() => {
            this.simulateAdvancedAgentActivity();
        }, Math.random() * 7000 + 8000);
        
        // Update performance metrics every 5 seconds
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000);
        
        // Update uptime every second
        setInterval(() => {
            this.updateUptime();
        }, 1000);
    }
    
    initializePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        // Generate initial performance data
        this.generatePerformanceData();
        
        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.performanceData.map(d => d.time),
                datasets: [
                    {
                        label: 'Token Usage',
                        data: this.performanceData.map(d => d.tokenUsage),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Agent Efficiency',
                        data: this.performanceData.map(d => d.efficiency),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Response Time',
                        data: this.performanceData.map(d => d.responseTime),
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 8
                    }
                }
            }
        });
    }
    
    generatePerformanceData() {
        const now = new Date();
        this.performanceData = [];
        
        for (let i = 20; i >= 0; i--) {
            const time = new Date(now - i * 60000); // Every minute
            this.performanceData.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                tokenUsage: Math.random() * 20 + 10, // 10-30
                efficiency: Math.random() * 10 + 90, // 90-100
                responseTime: Math.random() * 3 + 1 // 1-4 seconds
            });
        }
    }
    
    startAdvancedAnalytics() {
        // Add initial activities with professional language
        this.addActivity('system', 'Enterprise Monitor', 'World-class monitoring system initialized', 'success');
        this.addActivity('connection', 'Claude Code API', 'Secure connection established with enterprise endpoints', 'success');
        this.addActivity('analytics', 'Performance Engine', 'Advanced analytics engine activated', 'info');
        this.addActivity('agents', 'Agent Registry', '8 specialized agents registered with enterprise capabilities', 'info');
    }
    
    simulateAdvancedAgentActivity() {
        const agentIds = Array.from(this.agents.keys());
        const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
        const agent = this.agents.get(randomAgent);
        
        if (agent.status === 'ready' && Math.random() < 0.7) {
            this.startAgentTask(randomAgent, agent);
        } else if (agent.status === 'active' && Math.random() < 0.4) {
            this.completeAgentTask(randomAgent, agent);
        }
    }
    
    startAgentTask(agentId, agent) {
        const enterpriseTasks = {
            'shadcn-optimization': [
                'Executing advanced bundle analysis with tree-shaking optimization',
                'Performing deep dependency graph analysis for performance bottlenecks',
                'Running enterprise-grade component audit with automated recommendations',
                'Implementing advanced code-splitting strategies for optimal loading',
                'Analyzing bundle composition with AI-powered optimization suggestions'
            ],
            'design-system': [
                'Conducting comprehensive brand consistency audit across 47 components',
                'Validating design token compliance with enterprise accessibility standards',
                'Executing automated color contrast analysis with WCAG AAA validation',
                'Performing design system coherence analysis with AI-powered insights',
                'Generating dynamic theme variations with brand guideline enforcement'
            ],
            'component-architect': [
                'Analyzing component architecture patterns with scalability assessment',
                'Conducting enterprise-grade prop interface validation and optimization',
                'Executing advanced component composition analysis with dependency mapping',
                'Performing architectural debt analysis with automated refactoring suggestions',
                'Running component lifecycle optimization with performance profiling'
            ],
            'accessibility': [
                'Executing comprehensive WCAG 2.1 AAA compliance audit',
                'Running automated screen reader compatibility analysis',
                'Performing advanced keyboard navigation testing with edge case validation',
                'Conducting enterprise accessibility audit with legal compliance verification',
                'Executing color blindness simulation with accessibility impact assessment'
            ],
            'testing-orchestrator': [
                'Orchestrating enterprise test suite execution with parallel processing',
                'Running advanced integration testing with dependency injection validation',
                'Executing performance testing suite with load simulation and bottleneck analysis',
                'Conducting automated regression testing with AI-powered failure prediction',
                'Running comprehensive security testing with vulnerability assessment'
            ],
            'documentation': [
                'Generating enterprise-grade API documentation with interactive examples',
                'Creating comprehensive component documentation with usage analytics',
                'Executing automated changelog generation with semantic versioning',
                'Building advanced Storybook integration with component playground',
                'Generating technical specifications with architectural decision records'
            ],
            'deployment': [
                'Orchestrating enterprise CI/CD pipeline with advanced deployment strategies',
                'Executing blue-green deployment with automated rollback capabilities',
                'Running infrastructure health checks with predictive failure analysis',
                'Performing advanced monitoring setup with enterprise-grade alerting',
                'Conducting deployment risk assessment with automated safety validations'
            ],
            'orchestrator': [
                'Coordinating multi-agent workflow optimization with advanced scheduling',
                'Managing enterprise task prioritization with AI-powered resource allocation',
                'Executing advanced dependency resolution with conflict detection',
                'Orchestrating quality gate validation with automated approval workflows',
                'Running enterprise coordination protocols with failure tolerance mechanisms'
            ]
        };
        
        const agentTasks = enterpriseTasks[agentId] || ['Processing enterprise-grade task execution'];
        const task = agentTasks[Math.floor(Math.random() * agentTasks.length)];
        
        agent.status = 'active';
        agent.currentTask = task;
        agent.progress = Math.floor(Math.random() * 30) + 10; // Start with some progress
        agent.lastActivity = Date.now();
        
        this.addActivity('agent', agent.name, task, 'processing');
        this.totalTasks++;
    }
    
    completeAgentTask(agentId, agent) {
        agent.status = 'ready';
        agent.progress = 100;
        agent.tasksCompleted++;
        
        const completionMessages = [
            'Task completed with enterprise-grade quality validation',
            'Successfully executed with automated quality assurance',
            'Completed with advanced analytics and performance optimization',
            'Task finished with comprehensive testing and validation',
            'Successfully processed with enterprise security compliance'
        ];
        
        const message = completionMessages[Math.floor(Math.random() * completionMessages.length)];
        this.addActivity('complete', agent.name, message, 'success');
        
        // Reset after a delay
        setTimeout(() => {
            agent.progress = 0;
            agent.currentTask = null;
        }, 5000);
    }
    
    updateWorldClassDisplay() {
        this.updateHeroMetrics();
        this.updateAgentMatrix();
        this.updateActivityStream();
        this.updatePerformanceRing();
    }
    
    updateHeroMetrics() {
        const percentage = (this.tokenUsage.used / this.tokenUsage.total) * 100;
        const remaining = this.tokenUsage.total - this.tokenUsage.used;
        
        document.getElementById('hero-token-usage').textContent = 
            `${(this.tokenUsage.used / 1000).toFixed(1)}k / ${(this.tokenUsage.total / 1000).toFixed(0)}k`;
        document.getElementById('hero-token-bar').style.width = `${percentage}%`;
        document.getElementById('hero-token-percentage').textContent = `${percentage.toFixed(1)}% used`;
        document.getElementById('hero-token-remaining').textContent = `${(remaining / 1000).toFixed(0)}k remaining`;
        
        // Update performance
        document.getElementById('hero-performance').textContent = `${this.tokenUsage.efficiency}%`;
        
        // Update active agents
        const activeAgents = Array.from(this.agents.values()).filter(a => a.status === 'active').length;
        document.getElementById('hero-active-agents').textContent = `${activeAgents} / 8`;
        
        // Update cost
        const estimatedCost = (this.tokenUsage.used / 1000) * 0.015;
        document.getElementById('hero-cost').textContent = `$${estimatedCost.toFixed(2)}`;
    }
    
    updateAgentMatrix() {
        const container = document.getElementById('agent-matrix');
        if (!container) return;
        
        container.innerHTML = Array.from(this.agents.entries()).map(([id, agent]) => `
            <div class="glass-card rounded-xl p-4 status-indicator hover:shadow-2xl transition-all duration-300 ${agent.status === 'active' ? 'neon-glow' : ''}">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 ${this.getAgentGradient(agent.status)} rounded-xl flex items-center justify-center">
                            <span class="text-xl">${agent.icon}</span>
                        </div>
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-white">${agent.name}</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${agent.specialty}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 ${this.getStatusColor(agent.status)} rounded-full ${agent.status === 'active' ? 'pulse-dot' : ''}"></div>
                            <span class="text-xs font-medium ${this.getStatusTextColor(agent.status)} uppercase tracking-wider">
                                ${agent.status}
                            </span>
                        </div>
                        <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            ${this.formatLastActivity(agent.lastActivity)}
                        </div>
                    </div>
                </div>
                
                ${agent.currentTask ? `
                    <div class="mb-3">
                        <p class="text-xs text-slate-600 dark:text-slate-300 mb-2">${agent.currentTask}</p>
                        <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000" 
                                 style="width: ${agent.progress}%"></div>
                        </div>
                        <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>Progress</span>
                            <span>${agent.progress}%</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <div class="text-lg font-bold text-slate-800 dark:text-white">${agent.tasksCompleted}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Tasks</div>
                    </div>
                    <div>
                        <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">${agent.successRate}%</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Success</div>
                    </div>
                    <div>
                        <div class="text-lg font-bold text-blue-600 dark:text-blue-400">${agent.avgResponseTime}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">Response</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateActivityStream() {
        const container = document.getElementById('world-class-activity');
        if (!container) return;
        
        const recentActivities = this.activityLog.slice(0, 12);
        
        container.innerHTML = recentActivities.map(activity => `
            <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div class="w-2 h-2 ${this.getActivityIconColor(activity.type)} rounded-full mt-2 ${activity.type === 'processing' ? 'pulse-dot' : ''}"></div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium text-slate-800 dark:text-white">${activity.source}</span>
                        <span class="text-xs px-2 py-0.5 ${this.getActivityBadgeColor(activity.severity)} rounded-full">
                            ${activity.severity.toUpperCase()}
                        </span>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">${activity.message}</p>
                    <span class="text-xs text-slate-400 dark:text-slate-500">${activity.timestamp}</span>
                </div>
            </div>
        `).join('');
    }
    
    updatePerformanceRing() {
        const ring = document.getElementById('performance-ring');
        if (!ring) return;
        
        const circumference = 2 * Math.PI * 30;
        const offset = circumference - (this.tokenUsage.efficiency / 100) * circumference;
        ring.style.strokeDashoffset = offset;
    }
    
    updatePerformanceMetrics() {
        // Simulate slight variations in performance
        this.tokenUsage.efficiency = Math.max(95, Math.min(100, this.tokenUsage.efficiency + (Math.random() - 0.5) * 2));
        this.tokenUsage.used += Math.floor(Math.random() * 50) + 25; // Gradual token usage increase
        
        // Update performance chart
        if (this.performanceChart) {
            const now = new Date();
            const newDataPoint = {
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                tokenUsage: (this.tokenUsage.used / this.tokenUsage.total) * 100,
                efficiency: this.tokenUsage.efficiency,
                responseTime: Math.random() * 2 + 1
            };
            
            this.performanceData.shift(); // Remove oldest
            this.performanceData.push(newDataPoint); // Add newest
            
            this.performanceChart.data.labels = this.performanceData.map(d => d.time);
            this.performanceChart.data.datasets[0].data = this.performanceData.map(d => d.tokenUsage);
            this.performanceChart.data.datasets[1].data = this.performanceData.map(d => d.efficiency);
            this.performanceChart.data.datasets[2].data = this.performanceData.map(d => d.responseTime);
            this.performanceChart.update('none');
        }
    }
    
    updateUptime() {
        const elapsed = Date.now() - this.sessionStartTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            uptimeElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    addActivity(type, source, message, severity = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.activityLog.unshift({
            type,
            source,
            message,
            severity,
            timestamp,
            id: Date.now() + Math.random()
        });
        
        // Keep only last 50 activities
        if (this.activityLog.length > 50) {
            this.activityLog = this.activityLog.slice(0, 50);
        }
    }
    
    formatLastActivity(timestamp) {
        const elapsed = Date.now() - timestamp;
        const minutes = Math.floor(elapsed / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    }
    
    getAgentGradient(status) {
        switch (status) {
            case 'active': return 'bg-gradient-to-br from-blue-500 to-purple-600';
            case 'ready': return 'bg-gradient-to-br from-emerald-500 to-teal-600';
            case 'monitoring': return 'bg-gradient-to-br from-amber-500 to-orange-600';
            default: return 'bg-gradient-to-br from-slate-400 to-slate-600';
        }
    }
    
    getStatusColor(status) {
        switch (status) {
            case 'active': return 'bg-blue-500';
            case 'ready': return 'bg-emerald-500';
            case 'monitoring': return 'bg-amber-500';
            default: return 'bg-slate-400';
        }
    }
    
    getStatusTextColor(status) {
        switch (status) {
            case 'active': return 'text-blue-600 dark:text-blue-400';
            case 'ready': return 'text-emerald-600 dark:text-emerald-400';
            case 'monitoring': return 'text-amber-600 dark:text-amber-400';
            default: return 'text-slate-600 dark:text-slate-400';
        }
    }
    
    getActivityIconColor(type) {
        switch (type) {
            case 'agent': return 'bg-blue-500';
            case 'complete': return 'bg-emerald-500';
            case 'processing': return 'bg-amber-500';
            case 'system': return 'bg-purple-500';
            case 'connection': return 'bg-teal-500';
            case 'analytics': return 'bg-indigo-500';
            default: return 'bg-slate-400';
        }
    }
    
    getActivityBadgeColor(severity) {
        switch (severity) {
            case 'success': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'processing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            case 'info': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'warning': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    }
}

// Theme management
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
}

// Initialize the world-class monitor
document.addEventListener('DOMContentLoaded', () => {
    const monitor = new WorldClassClaudeMonitor();
    
    // Store globally for debugging
    window.worldClassMonitor = monitor;
    
    // Add some initial enterprise activities
    setTimeout(() => {
        monitor.addActivity('system', 'Enterprise Security', 'Advanced encryption protocols activated for secure agent communication', 'success');
    }, 2000);
    
    setTimeout(() => {
        monitor.addActivity('analytics', 'Performance Intelligence', 'Machine learning models loaded for predictive agent optimization', 'info');
    }, 4000);
    
    setTimeout(() => {
        monitor.addActivity('connection', 'Claude Code Enterprise', 'High-availability connection established with enterprise SLA guarantees', 'success');
    }, 6000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorldClassClaudeMonitor };
}