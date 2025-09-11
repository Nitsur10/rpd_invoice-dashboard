// Real-time workflow visualization component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/lib/icons';

export interface Agent {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  description: string;
  status: 'idle' | 'queued' | 'active' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
  dependencies: string[];
  outputs: string[];
  estimatedTime: number;
  actualTime?: number;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  agents: Agent[];
  dependencies: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'executing' | 'completed' | 'failed';
  phases: WorkflowPhase[];
  startTime?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  qualityGates: QualityGate[];
}

export interface QualityGate {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed';
  criteria: string[];
  agent: string;
}

export const WorkflowVisualizer: React.FC<{ workflow: Workflow }> = ({ workflow }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: Agent['status'] | WorkflowPhase['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-600';
      case 'queued': return 'bg-yellow-100 text-yellow-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'idle': return Icons.clock;
      case 'queued': return Icons.calendar;
      case 'active': return Icons.activity;
      case 'completed': return Icons.checkCircle;
      case 'failed': return Icons.alertTriangle;
      default: return Icons.clock;
    }
  };

  const formatDuration = (minutes: number) => {
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🎯 {workflow.name}
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.toUpperCase()}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {workflow.description}
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">
                ⏱️ Est: {formatDuration(workflow.estimatedDuration)}
              </div>
              {workflow.actualDuration && (
                <div className="text-muted-foreground">
                  Actual: {formatDuration(workflow.actualDuration)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Phase Progress */}
      {workflow.phases.map((phase, phaseIndex) => (
        <Card key={phase.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">
                  {phase.status === 'completed' ? '✅' : 
                   phase.status === 'active' ? '⚡' :
                   phase.status === 'failed' ? '❌' : '📋'}
                </span>
                Phase {phaseIndex + 1}: {phase.name}
                <Badge className={getStatusColor(phase.status)}>
                  {phase.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {phase.agents.map((agent) => {
                const StatusIcon = getStatusIcon(agent.status);
                return (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{
                            agent.icon === 'settings' ? '🎨' :
                            agent.icon === 'building' ? '🏗️' :
                            agent.icon === 'trendingUp' ? '📈' :
                            agent.icon === 'eye' ? '♿' :
                            agent.icon === 'activity' ? '🧪' :
                            agent.icon === 'fileText' ? '📚' :
                            agent.icon === 'arrowUpRight' ? '🚀' : '🤖'
                          }</span>
                          <div>
                            <h4 className="font-semibold">{agent.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {formatDuration(agent.estimatedTime)}
                        </div>
                        {agent.actualTime && (
                          <div className="text-muted-foreground">
                            Actual: {formatDuration(agent.actualTime)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {agent.status === 'active' && (
                      <div className="space-y-2">
                        <Progress value={agent.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{agent.currentTask || 'Processing...'}</span>
                          <span>{agent.progress}%</span>
                        </div>
                      </div>
                    )}

                    {/* Agent Outputs */}
                    {agent.outputs.length > 0 && agent.status === 'completed' && (
                      <div className="mt-3 p-2 bg-green-50 rounded">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          ✅ Outputs Generated:
                        </div>
                        <div className="text-xs text-green-700">
                          {agent.outputs.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Dependencies */}
                    {agent.dependencies.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Dependencies: {agent.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Quality Gates */}
      {workflow.qualityGates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛡️ Quality Gates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflow.qualityGates.map((gate) => (
                <div key={gate.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{gate.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      Agent: {gate.agent}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {gate.criteria.join(' • ')}
                    </div>
                  </div>
                  <Badge className={getStatusColor(gate.status)}>
                    {gate.status === 'passed' ? '✅ PASSED' :
                     gate.status === 'failed' ? '❌ FAILED' :
                     '⏳ PENDING'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Demo data for testing
export const demoWorkflow: Workflow = {
  id: 'demo-optimization',
  name: 'Dashboard Performance Optimization',
  description: 'Comprehensive optimization of invoice dashboard with accessibility validation',
  status: 'executing',
  estimatedDuration: 12,
  phases: [
    {
      id: 'phase-1',
      name: 'Analysis & Foundation',
      status: 'active',
      dependencies: [],
      agents: [
        {
          id: 'shadcn-opt',
          name: 'ShadCN Optimization Agent',
          icon: 'trendingUp',
          description: 'Bundle analysis and component optimization',
          status: 'active',
          progress: 75,
          currentTask: 'Analyzing component bundle sizes',
          dependencies: [],
          outputs: ['Bundle analysis report', 'Optimization recommendations'],
          estimatedTime: 4,
        },
        {
          id: 'comp-arch',
          name: 'Component Architect Agent',
          icon: 'building',
          description: 'Architecture review and pattern analysis',
          status: 'queued',
          progress: 0,
          dependencies: ['shadcn-opt'],
          outputs: [],
          estimatedTime: 3,
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'Implementation & Validation',
      status: 'pending',
      dependencies: ['phase-1'],
      agents: [
        {
          id: 'accessibility',
          name: 'Accessibility Agent',
          icon: 'eye',
          description: 'WCAG compliance validation',
          status: 'idle',
          progress: 0,
          dependencies: ['shadcn-opt'],
          outputs: [],
          estimatedTime: 3,
        },
        {
          id: 'testing',
          name: 'Testing Orchestrator Agent',
          icon: 'activity',
          description: 'Performance testing and validation',
          status: 'idle',
          progress: 0,
          dependencies: ['shadcn-opt', 'accessibility'],
          outputs: [],
          estimatedTime: 2,
        }
      ]
    }
  ],
  qualityGates: [
    {
      id: 'perf-gate',
      name: 'Performance Benchmark',
      status: 'pending',
      agent: 'ShadCN Optimization Agent',
      criteria: ['Bundle size < 200KB', 'LCP < 1.5s', 'CLS < 0.1']
    },
    {
      id: 'a11y-gate',
      name: 'Accessibility Compliance',
      status: 'pending',
      agent: 'Accessibility Agent',
      criteria: ['WCAG AA compliance', 'Contrast ratio > 4.5:1', 'Keyboard navigation']
    }
  ],
  startTime: new Date(Date.now() - 3 * 60 * 1000) // Started 3 minutes ago
};