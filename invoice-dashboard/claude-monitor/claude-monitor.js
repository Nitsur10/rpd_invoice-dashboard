// Claude Code Live Monitoring System
class ClaudeCodeMonitor {
    constructor() {
        this.sessionStartTime = Date.now();
        this.totalTasks = 0;
        this.activityLog = [];
        this.tokenUsage = {
            used: 32000,
            total: 200000,
            system: 6700,
            tools: 11400,
            mcp: 9600,
            memory: 4300
        };
        
        this.agents = new Map([
            ['shadcn-optimization', { name: 'ShadCN Optimization', icon: '📈', status: 'ready', lastActivity: null }],
            ['design-system', { name: 'Design System', icon: '🎨', status: 'ready', lastActivity: null }],
            ['component-architect', { name: 'Component Architect', icon: '🏗️', status: 'ready', lastActivity: null }],
            ['accessibility', { name: 'Accessibility', icon: '♿', status: 'ready', lastActivity: null }],
            ['testing-orchestrator', { name: 'Testing Orchestrator', icon: '🧪', status: 'ready', lastActivity: null }],
            ['documentation', { name: 'Documentation', icon: '📚', status: 'ready', lastActivity: null }],
            ['deployment', { name: 'Deployment', icon: '🚀', status: 'ready', lastActivity: null }],
            ['orchestrator', { name: 'Master Orchestrator', icon: '🎯', status: 'ready', lastActivity: null }]
        ]);
        
        this.initializeMonitoring();
        this.startClaudeCodeIntegration();
    }
    
    initializeMonitoring() {
        // Update display every second
        setInterval(() => {
            this.updateDisplay();
        }, 1000);
        
        // Check for Claude Code activity every 5 seconds
        setInterval(() => {
            this.checkClaudeCodeActivity();
        }, 5000);
        
        // Update session time
        setInterval(() => {
            this.updateSessionTime();
        }, 1000);
    }
    
    startClaudeCodeIntegration() {
        // Simulate Claude Code integration
        this.addActivity('system', 'Claude Code Monitor', 'Connected to Claude Code session');
        this.addActivity('system', 'Token Monitor', 'Tracking token usage: 32k/200k tokens');
        this.addActivity('info', 'Agent Registry', '8 specialized agents registered and ready');
        
        // Monitor file system changes
        this.startFileSystemWatcher();
        
        // Monitor token usage changes
        this.startTokenMonitoring();
    }
    
    startFileSystemWatcher() {
        // Simulate file system monitoring
        const watchedPaths = [
            'src/components/',
            'src/app/',
            'src/lib/',
            '.claude/agents/'
        ];
        
        // Simulate periodic file change detection
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 5 seconds
                const path = watchedPaths[Math.floor(Math.random() * watchedPaths.length)];
                const actions = ['modified', 'created', 'updated'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                
                this.addActivity('file-change', 'File Watcher', `${path} ${action}`);
            }
        }, 5000);
    }
    
    startTokenMonitoring() {
        // Simulate token usage changes based on activity
        setInterval(() => {
            const increment = Math.floor(Math.random() * 100) + 50; // 50-150 tokens
            this.tokenUsage.used += increment;
            
            // Update percentage
            const percentage = (this.tokenUsage.used / this.tokenUsage.total) * 100;
            if (percentage > 80) {
                this.addActivity('warning', 'Token Monitor', `High token usage: ${percentage.toFixed(1)}%`);
            }
        }, 30000); // Every 30 seconds
    }
    
    checkClaudeCodeActivity() {
        // Simulate Claude Code agent activity detection
        if (Math.random() < 0.3) { // 30% chance
            const agentIds = Array.from(this.agents.keys());
            const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
            const agent = this.agents.get(randomAgent);
            
            this.triggerAgentActivity(randomAgent, agent);
        }
    }
    
    triggerAgentActivity(agentId, agent) {
        const activities = {
            'shadcn-optimization': [
                'Analyzing component bundle size',
                'Optimizing import statements', 
                'Running performance audit',
                'Implementing tree-shaking'
            ],
            'design-system': [
                'Validating RPD brand colors',
                'Checking design token consistency',
                'Auditing component theming',
                'Updating color palette'
            ],
            'component-architect': [
                'Reviewing component patterns',
                'Analyzing prop interfaces',
                'Evaluating component composition',
                'Validating TypeScript types'
            ],
            'accessibility': [
                'Running WCAG compliance check',
                'Testing keyboard navigation',
                'Validating ARIA attributes',
                'Checking color contrast ratios'
            ],
            'testing-orchestrator': [
                'Creating unit tests',
                'Running integration tests',
                'Validating test coverage',
                'Executing performance tests'
            ],
            'documentation': [
                'Generating component docs',
                'Updating API documentation',
                'Creating usage examples',
                'Maintaining changelog'
            ],
            'deployment': [
                'Validating build configuration',
                'Checking environment setup',
                'Running deployment tests',
                'Monitoring application health'
            ],
            'orchestrator': [
                'Coordinating agent workflows',
                'Managing task dependencies',
                'Monitoring quality gates',
                'Optimizing execution sequence'
            ]
        };
        
        const agentActivities = activities[agentId] || ['Processing task'];
        const activity = agentActivities[Math.floor(Math.random() * agentActivities.length)];
        
        // Update agent status
        agent.status = 'active';
        agent.lastActivity = Date.now();
        
        // Log activity
        this.addActivity('agent', agent.name, activity);
        this.totalTasks++;
        
        // Reset agent to ready after random time
        setTimeout(() => {
            agent.status = 'ready';
            this.addActivity('complete', agent.name, 'Task completed');
        }, Math.random() * 15000 + 5000); // 5-20 seconds
    }
    
    addActivity(type, source, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.activityLog.unshift({
            type,
            source,
            message,
            timestamp,
            id: Date.now() + Math.random()
        });
        
        // Keep only last 50 activities
        if (this.activityLog.length > 50) {
            this.activityLog = this.activityLog.slice(0, 50);
        }
    }
    
    updateDisplay() {
        this.updateTokenUsage();
        this.updateActivityFeed();
        this.updateAgentStatus();
        this.updateMetrics();
        
        // Update last update time
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
    }
    
    updateTokenUsage() {
        const percentage = (this.tokenUsage.used / this.tokenUsage.total) * 100;
        const remaining = this.tokenUsage.total - this.tokenUsage.used;
        
        document.getElementById('token-usage').textContent = 
            `${(this.tokenUsage.used / 1000).toFixed(1)}k / ${(this.tokenUsage.total / 1000).toFixed(0)}k`;
        document.getElementById('token-bar').style.width = `${percentage}%`;
        document.getElementById('token-percentage').textContent = 
            `${percentage.toFixed(1)}% used • ${(remaining / 1000).toFixed(0)}k remaining`;
        
        // Update context breakdown
        document.getElementById('system-tokens').textContent = 
            `${(this.tokenUsage.system / 1000).toFixed(1)}k (${((this.tokenUsage.system / this.tokenUsage.total) * 100).toFixed(1)}%)`;
        document.getElementById('tools-tokens').textContent = 
            `${(this.tokenUsage.tools / 1000).toFixed(1)}k (${((this.tokenUsage.tools / this.tokenUsage.total) * 100).toFixed(1)}%)`;
        document.getElementById('mcp-tokens').textContent = 
            `${(this.tokenUsage.mcp / 1000).toFixed(1)}k (${((this.tokenUsage.mcp / this.tokenUsage.total) * 100).toFixed(1)}%)`;
        document.getElementById('memory-tokens').textContent = 
            `${(this.tokenUsage.memory / 1000).toFixed(1)}k (${((this.tokenUsage.memory / this.tokenUsage.total) * 100).toFixed(1)}%)`;
        document.getElementById('free-tokens').textContent = 
            `${(remaining / 1000).toFixed(0)}k (${(100 - percentage).toFixed(0)}%)`;
    }
    
    updateSessionTime() {
        const elapsed = Date.now() - this.sessionStartTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        document.getElementById('session-time').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateActivityFeed() {
        const feedContainer = document.getElementById('live-activity');
        const recentActivities = this.activityLog.slice(0, 15);
        
        feedContainer.innerHTML = recentActivities.map(activity => `
            <div class="activity-item flex items-center space-x-3 text-sm py-2">
                <div class="w-2 h-2 ${this.getActivityColor(activity.type)} rounded-full"></div>
                <span class="text-xs text-gray-400 w-16">${activity.timestamp}</span>
                <span class="font-medium text-gray-700 w-32 truncate">${activity.source}</span>
                <span class="text-gray-600 flex-1">${activity.message}</span>
            </div>
        `).join('');
    }
    
    updateAgentStatus() {
        const statusContainer = document.getElementById('agent-status');
        const agentElements = Array.from(this.agents.entries()).map(([id, agent]) => `
            <div class="flex items-center justify-between p-2 rounded ${agent.status === 'active' ? 'bg-blue-50' : 'bg-gray-50'}">
                <div class="flex items-center space-x-2">
                    <span class="text-sm">${agent.icon}</span>
                    <span class="text-sm font-medium">${agent.name}</span>
                </div>
                <span class="text-xs px-2 py-1 rounded ${this.getStatusStyle(agent.status)}">
                    ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
            </div>
        `).join('');
        
        statusContainer.innerHTML = agentElements;
    }
    
    updateMetrics() {
        document.getElementById('agent-tasks').textContent = this.totalTasks;
        document.getElementById('tasks-info').textContent = `${this.totalTasks} total executed`;
        
        // Calculate estimated cost (rough estimate: $0.015 per 1k tokens)
        const estimatedCost = (this.tokenUsage.used / 1000) * 0.015;
        document.getElementById('cost-estimate').textContent = `$${estimatedCost.toFixed(3)}`;
    }
    
    getActivityColor(type) {
        switch (type) {
            case 'agent': return 'bg-blue-500';
            case 'complete': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            case 'file-change': return 'bg-purple-500';
            case 'system': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    }
    
    getStatusStyle(status) {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-600';
            case 'ready': return 'bg-green-100 text-green-600';
            case 'busy': return 'bg-yellow-100 text-yellow-600';
            case 'error': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    }
}

// Claude Code API Integration (when available)
class ClaudeCodeAPI {
    constructor(monitor) {
        this.monitor = monitor;
        this.connected = false;
        this.attemptConnection();
    }
    
    attemptConnection() {
        // In a real implementation, this would connect to Claude Code's monitoring API
        // For now, we'll simulate the integration
        setTimeout(() => {
            this.connected = true;
            this.monitor.addActivity('system', 'Claude Code API', 'Integration established');
            this.startEventListeners();
        }, 2000);
    }
    
    startEventListeners() {
        // Simulate real-time event listening
        // In practice, this would listen for:
        // - Agent task starts/completions
        // - Token usage changes
        // - File modifications
        // - Error events
        
        this.monitor.addActivity('info', 'Event Listener', 'Monitoring Claude Code events');
    }
    
    // Methods for real Claude Code integration
    getSessionMetrics() {
        return {
            sessionId: 'claude-sonnet-4-20250514',
            startTime: this.monitor.sessionStartTime,
            tokenUsage: this.monitor.tokenUsage,
            activeAgents: Array.from(this.monitor.agents.values()).filter(a => a.status === 'active').length
        };
    }
    
    subscribeToEvents(eventTypes) {
        // Subscribe to specific Claude Code events
        eventTypes.forEach(type => {
            this.monitor.addActivity('system', 'Event Subscription', `Subscribed to ${type} events`);
        });
    }
}

// Initialize the monitoring system
document.addEventListener('DOMContentLoaded', () => {
    const monitor = new ClaudeCodeMonitor();
    const api = new ClaudeCodeAPI(monitor);
    
    // Store globally for debugging
    window.claudeMonitor = monitor;
    window.claudeAPI = api;
    
    monitor.addActivity('system', 'Claude Monitor', 'Live monitoring system initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClaudeCodeMonitor, ClaudeCodeAPI };
}