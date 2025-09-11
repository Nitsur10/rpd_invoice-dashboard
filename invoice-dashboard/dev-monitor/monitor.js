// Agent Development Monitor - Real-time tracking system
class AgentMonitor {
    constructor() {
        this.agents = new Map();
        this.activityLog = [];
        this.totalTasks = 0;
        this.completedTasks = 0;
        this.activeTasks = 0;
        this.autoRefresh = true;
        
        this.initializeAgents();
        this.startMonitoring();
    }
    
    initializeAgents() {
        const agentConfigs = [
            {
                id: 'shadcn-optimization',
                name: 'ShadCN Optimization',
                icon: '📈',
                avgDuration: 5,
                capabilities: ['performance', 'bundle-analysis', 'optimization'],
                completedTasks: 0,
                status: 'idle'
            },
            {
                id: 'design-system',
                name: 'Design System',
                icon: '🎨',
                avgDuration: 3,
                capabilities: ['design-tokens', 'branding', 'themes'],
                completedTasks: 0,
                status: 'idle'
            },
            {
                id: 'component-architect',
                name: 'Component Architect',
                icon: '🏗️',
                avgDuration: 4,
                capabilities: ['architecture', 'patterns', 'scalability'],
                completedTasks: 0,
                status: 'idle'
            },
            {
                id: 'accessibility',
                name: 'Accessibility',
                icon: '♿',
                avgDuration: 3,
                capabilities: ['wcag', 'a11y', 'compliance'],
                completedTasks: 0,
                status: 'idle'
            },
            {
                id: 'testing-orchestrator',
                name: 'Testing Orchestrator',
                icon: '🧪',
                avgDuration: 4,
                capabilities: ['testing', 'quality-assurance', 'automation'],
                completedTasks: 0,
                status: 'idle'
            },
            {
                id: 'documentation',
                name: 'Documentation',
                icon: '📚',
                avgDuration: 2,
                capabilities: ['documentation', 'storybook', 'guides'],
                completedTasks: 0,
                status: 'idle'
            },
            {
                id: 'deployment',
                name: 'Deployment',
                icon: '🚀',
                avgDuration: 3,
                capabilities: ['cicd', 'deployment', 'infrastructure'],
                completedTasks: 0,
                status: 'idle'
            }
        ];
        
        agentConfigs.forEach(config => {
            this.agents.set(config.id, {
                ...config,
                currentTask: null,
                progress: 0,
                startTime: null,
                recentOutputs: [],
                taskHistory: []
            });
        });
    }
    
    startMonitoring() {
        // Update display every second
        setInterval(() => {
            if (this.autoRefresh) {
                this.updateDisplay();
            }
        }, 1000);
        
        // Simulate periodic agent activity
        this.scheduleRandomActivity();
    }
    
    updateDisplay() {
        this.updateStats();
        this.updateAgentCards();
        this.updateActivityLog();
    }
    
    updateStats() {
        document.getElementById('total-tasks').textContent = this.totalTasks;
        document.getElementById('completed-tasks').textContent = this.completedTasks;
        document.getElementById('active-tasks').textContent = this.activeTasks;
        
        const avgTime = this.calculateAverageTime();
        document.getElementById('avg-time').textContent = `${avgTime}min`;
        
        document.getElementById('active-workflows').textContent = `${this.activeTasks} Active Workflows`;
    }
    
    updateAgentCards() {
        this.agents.forEach((agent, agentId) => {
            const card = document.querySelector(`[data-agent="${agentId}"]`);
            if (!card) return;
            
            // Update status
            const statusEl = card.querySelector('.agent-status');
            statusEl.textContent = agent.status.toUpperCase();
            statusEl.className = `agent-status text-sm font-medium ${this.getStatusColor(agent.status)}`;
            
            // Update current task
            const taskEl = card.querySelector('.current-task');
            if (agent.currentTask) {
                taskEl.style.display = 'block';
                taskEl.querySelector('.task-description').textContent = agent.currentTask;
            } else {
                taskEl.style.display = 'none';
            }
            
            // Update progress
            const progressContainer = card.querySelector('.progress-container');
            if (agent.status === 'active' && agent.progress > 0) {
                progressContainer.style.display = 'block';
                const progressBar = card.querySelector('.progress-bar');
                const progressText = card.querySelector('.progress-percentage');
                progressBar.style.width = `${agent.progress}%`;
                progressText.textContent = `${agent.progress}%`;
            } else {
                progressContainer.style.display = 'none';
            }
            
            // Update completed tasks
            card.querySelector('.tasks-completed').textContent = agent.completedTasks;
            
            // Update recent outputs
            const outputsList = card.querySelector('.outputs-list');
            if (agent.recentOutputs.length > 0) {
                outputsList.textContent = agent.recentOutputs.slice(-3).join(', ');
            } else {
                outputsList.textContent = 'No recent outputs';
            }
        });
    }
    
    updateActivityLog() {
        const logContainer = document.getElementById('activity-log');
        const recentLogs = this.activityLog.slice(-10).reverse();
        
        logContainer.innerHTML = recentLogs.map(log => `
            <div class="flex items-center space-x-3 text-sm">
                <div class="w-2 h-2 ${this.getLogColor(log.type)} rounded-full"></div>
                <span class="text-xs text-gray-400">${log.timestamp}</span>
                <span class="text-gray-700">${log.agent}</span>
                <span class="text-gray-600">${log.message}</span>
            </div>
        `).join('');
    }
    
    getStatusColor(status) {
        switch (status) {
            case 'active': return 'text-blue-600 bg-blue-100 px-2 py-1 rounded';
            case 'completed': return 'text-green-600 bg-green-100 px-2 py-1 rounded';
            case 'failed': return 'text-red-600 bg-red-100 px-2 py-1 rounded';
            case 'queued': return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded';
            default: return 'text-gray-600 bg-gray-100 px-2 py-1 rounded';
        }
    }
    
    getLogColor(type) {
        switch (type) {
            case 'start': return 'bg-blue-500';
            case 'complete': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'info': return 'bg-gray-500';
            default: return 'bg-gray-300';
        }
    }
    
    calculateAverageTime() {
        const completedAgents = Array.from(this.agents.values()).filter(a => a.completedTasks > 0);
        if (completedAgents.length === 0) return 0;
        
        const totalTime = completedAgents.reduce((sum, agent) => sum + agent.avgDuration, 0);
        return Math.round(totalTime / completedAgents.length);
    }
    
    scheduleRandomActivity() {
        // Schedule random agent activity every 15-45 seconds
        const delay = Math.random() * 30000 + 15000;
        setTimeout(() => {
            this.simulateRandomTask();
            this.scheduleRandomActivity();
        }, delay);
    }
    
    simulateRandomTask() {
        const idleAgents = Array.from(this.agents.values()).filter(a => a.status === 'idle');
        if (idleAgents.length === 0) return;
        
        const agent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
        this.startAgentTask(agent.id, this.generateRandomTask(agent));
    }
    
    generateRandomTask(agent) {
        const tasks = {
            'shadcn-optimization': [
                'Analyzing bundle dependencies',
                'Optimizing component imports',
                'Running performance benchmarks',
                'Implementing tree-shaking',
                'Measuring Core Web Vitals'
            ],
            'design-system': [
                'Updating design tokens',
                'Validating brand consistency',
                'Generating color palettes',
                'Creating theme variations',
                'Auditing component styles'
            ],
            'component-architect': [
                'Reviewing component patterns',
                'Analyzing architecture dependencies',
                'Designing component interfaces',
                'Planning component hierarchy',
                'Evaluating scalability patterns'
            ],
            'accessibility': [
                'Running WCAG compliance check',
                'Testing keyboard navigation',
                'Validating color contrast ratios',
                'Auditing screen reader compatibility',
                'Checking focus indicators'
            ],
            'testing-orchestrator': [
                'Creating test suites',
                'Running automated tests',
                'Performing regression testing',
                'Validating component behavior',
                'Generating test reports'
            ],
            'documentation': [
                'Generating component docs',
                'Creating Storybook stories',
                'Updating API documentation',
                'Writing usage examples',
                'Maintaining changelog'
            ],
            'deployment': [
                'Configuring CI/CD pipeline',
                'Deploying to staging',
                'Running deployment tests',
                'Monitoring deployment health',
                'Updating infrastructure'
            ]
        };
        
        const agentTasks = tasks[agent.id] || ['Processing task'];
        return agentTasks[Math.floor(Math.random() * agentTasks.length)];
    }
    
    startAgentTask(agentId, taskDescription) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        agent.status = 'active';
        agent.currentTask = taskDescription;
        agent.progress = 0;
        agent.startTime = Date.now();
        
        this.totalTasks++;
        this.activeTasks++;
        
        this.addLog('start', agent.name, `Started: ${taskDescription}`);
        
        // Simulate progress
        this.simulateProgress(agentId);
    }
    
    simulateProgress(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent || agent.status !== 'active') return;
        
        const progressInterval = setInterval(() => {
            if (agent.status !== 'active') {
                clearInterval(progressInterval);
                return;
            }
            
            agent.progress += Math.random() * 15 + 5; // 5-20% progress increments
            
            if (agent.progress >= 100) {
                agent.progress = 100;
                clearInterval(progressInterval);
                
                // Complete the task after a short delay
                setTimeout(() => {
                    this.completeAgentTask(agentId);
                }, 1000);
            }
        }, 500 + Math.random() * 1000); // Update every 0.5-1.5 seconds
    }
    
    completeAgentTask(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        agent.status = 'completed';
        agent.completedTasks++;
        agent.taskHistory.push({
            task: agent.currentTask,
            duration: Date.now() - agent.startTime,
            timestamp: new Date().toISOString()
        });
        
        // Generate outputs
        const outputs = this.generateOutputs(agentId);
        agent.recentOutputs.push(...outputs);
        if (agent.recentOutputs.length > 5) {
            agent.recentOutputs = agent.recentOutputs.slice(-5);
        }
        
        this.completedTasks++;
        this.activeTasks--;
        
        this.addLog('complete', agent.name, `Completed: ${agent.currentTask}`);
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
            agent.status = 'idle';
            agent.currentTask = null;
            agent.progress = 0;
        }, 3000);
    }
    
    generateOutputs(agentId) {
        const outputs = {
            'shadcn-optimization': ['Bundle analysis report', 'Performance metrics', 'Optimization recommendations'],
            'design-system': ['Design tokens', 'Brand guidelines', 'Theme configuration'],
            'component-architect': ['Component blueprints', 'Architecture docs', 'Pattern library'],
            'accessibility': ['A11y audit report', 'WCAG compliance check', 'Accessibility fixes'],
            'testing-orchestrator': ['Test suite', 'Coverage report', 'Test results'],
            'documentation': ['Component docs', 'Storybook stories', 'API reference'],
            'deployment': ['Deployment config', 'CI/CD pipeline', 'Infrastructure setup']
        };
        
        const agentOutputs = outputs[agentId] || ['Task output'];
        return [agentOutputs[Math.floor(Math.random() * agentOutputs.length)]];
    }
    
    addLog(type, agent, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.activityLog.push({ type, agent, message, timestamp });
        
        // Keep only last 50 logs
        if (this.activityLog.length > 50) {
            this.activityLog = this.activityLog.slice(-50);
        }
    }
}

// Global functions for controls
let monitor;

function initializeMonitor() {
    monitor = new AgentMonitor();
}

function simulateAgentWork() {
    if (!monitor) return;
    
    // Start multiple agents with different tasks
    const agents = Array.from(monitor.agents.keys());
    const numAgents = Math.min(3, agents.length);
    
    for (let i = 0; i < numAgents; i++) {
        const agentId = agents[Math.floor(Math.random() * agents.length)];
        const agent = monitor.agents.get(agentId);
        
        if (agent && agent.status === 'idle') {
            const task = monitor.generateRandomTask(agent);
            monitor.startAgentTask(agentId, task);
        }
    }
}

function clearLogs() {
    if (!monitor) return;
    
    monitor.activityLog = [];
    monitor.addLog('info', 'System', 'Activity log cleared');
}

function exportMetrics() {
    if (!monitor) return;
    
    const metrics = {
        timestamp: new Date().toISOString(),
        totalTasks: monitor.totalTasks,
        completedTasks: monitor.completedTasks,
        activeTasks: monitor.activeTasks,
        agents: Array.from(monitor.agents.entries()).map(([id, agent]) => ({
            id,
            name: agent.name,
            completedTasks: agent.completedTasks,
            avgDuration: agent.avgDuration,
            status: agent.status,
            recentOutputs: agent.recentOutputs
        })),
        activityLog: monitor.activityLog
    };
    
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    monitor.addLog('info', 'System', 'Metrics exported successfully');
}

function toggleAutoRefresh() {
    if (!monitor) return;
    
    monitor.autoRefresh = !monitor.autoRefresh;
    const button = event.target;
    button.textContent = `🔄 Auto Refresh: ${monitor.autoRefresh ? 'ON' : 'OFF'}`;
    button.className = monitor.autoRefresh 
        ? 'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
        : 'bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors';
    
    monitor.addLog('info', 'System', `Auto refresh ${monitor.autoRefresh ? 'enabled' : 'disabled'}`);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeMonitor);

// Add some demo data on load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (monitor) {
            monitor.addLog('info', 'System', 'Agent monitoring system initialized');
            monitor.addLog('info', 'System', '8 agents registered and ready');
        }
    }, 1000);
});