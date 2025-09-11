'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  Calendar,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { getAPIInvoiceData } from '@/lib/api-chart-data';
import { useDateFilter } from '@/contexts/date-filter-context';
import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';

// Generate real alerts from invoice data using snake_case field names
function generateCriticalAlerts(invoices: Invoice[]) {
  const today = new Date();
  const alerts = [];
  
  // Severely overdue invoices (20+ days) using snake_case field names
  const severelyOverdue = invoices.filter(inv => {
    if (inv.payment_status !== 'overdue') return false;
    const dueDate = new Date(inv.due_date || 0);
    const daysPast = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysPast >= 20;
  });
  
  if (severelyOverdue.length > 0) {
    alerts.push({
      id: 'severely_overdue',
      type: 'severely_overdue',
      title: 'Severely Overdue',
      count: severelyOverdue.length,
      description: '20+ days overdue',
      icon: AlertTriangle,
      color: 'oklch(0.60 0.20 20)',
      bgColor: 'oklch(0.60 0.20 20 / 0.1)',
      priority: 'critical',
      vendors: severelyOverdue.slice(0, 3).map(inv => inv.supplier_name || 'Unknown')
    });
  }
  
  // Overdue invoices (general) using snake_case field names
  const overdue = invoices.filter(inv => inv.payment_status === 'overdue');
  const regularOverdue = overdue.filter(inv => {
    const dueDate = new Date(inv.due_date || 0);
    const daysPast = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysPast < 20 && daysPast > 0;
  });
  
  if (regularOverdue.length > 0) {
    alerts.push({
      id: 'overdue',
      type: 'overdue',
      title: 'Overdue Payments',
      count: regularOverdue.length,
      description: 'Past due date',
      icon: Clock,
      color: 'oklch(0.70 0.18 50)',
      bgColor: 'oklch(0.70 0.18 50 / 0.1)',
      priority: 'high',
      vendors: regularOverdue.slice(0, 3).map(inv => inv.supplier_name || 'Unknown')
    });
  }
  
  // Due this week
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const dueThisWeek = invoices.filter(inv => {
    if (inv.payment_status !== 'pending') return false;
    const dueDate = new Date(inv.due_date || 0);
    return dueDate >= today && dueDate <= nextWeek;
  });
  
  if (dueThisWeek.length > 0) {
    alerts.push({
      id: 'due_this_week',
      type: 'due_this_week', 
      title: 'Due This Week',
      count: dueThisWeek.length,
      description: 'Require attention',
      icon: Calendar,
      color: 'oklch(0.45 0.12 200)',
      bgColor: 'oklch(0.45 0.12 200 / 0.1)',
      priority: 'medium',
      vendors: dueThisWeek.slice(0, 3).map(inv => inv.supplier_name || 'Unknown')
    });
  }
  
  return alerts;
}

// Generate priority actions from real data using snake_case field names
function generatePriorityActions(invoices: Invoice[]) {
  const today = new Date();
  const actions = [];
  
  // Get most overdue invoices for actions using snake_case field names
  const overdueInvoices = invoices
    .filter(inv => inv.payment_status === 'overdue')
    .map(inv => {
      const dueDate = new Date(inv.due_date || 0);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return { ...inv, daysOverdue };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 3);
  
  overdueInvoices.forEach(invoice => {
    actions.push({
      id: invoice.id,
      action: invoice.daysOverdue >= 20 ? 'Follow up' : 'Send reminder',
      vendor: invoice.supplier_name || 'Unknown',
      amount: `$${(invoice.total || 0).toLocaleString()}`,
      daysOverdue: invoice.daysOverdue,
      urgency: invoice.daysOverdue >= 20 ? 'critical' : 'high'
    });
  });
  
  return actions;
}

export function CriticalAlerts() {
  const { dateRange } = useDateFilter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getAPIInvoiceData(dateRange.from, dateRange.to);
        setInvoices(data);
      } catch (error) {
        console.error('Error loading critical alerts data:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange]);
  
  const criticalAlerts = generateCriticalAlerts(invoices);
  const priorityActions = generatePriorityActions(invoices);
  const totalAlerts = criticalAlerts.reduce((sum, alert) => sum + alert.count, 0);
  const resolvedToday = 0; // This would need additional tracking
  const responseTime = "2.1h"; // This would need actual response time calculation
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span style={{color: 'oklch(0.1 0.1 240)'}}>Critical Alerts</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>Active</span>
          </div>
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Urgent items requiring immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading critical alerts...</p>
            </div>
          </div>
        ) : (
          <>
        {/* Alert Summary */}
        <div className="space-y-3 mb-6">
          {criticalAlerts.map((alert) => {
            const Icon = alert.icon;
            
            return (
              <div 
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-slate-50"
                style={{
                  borderColor: 'oklch(0.85 0.04 240)',
                  backgroundColor: alert.bgColor
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{backgroundColor: alert.color}}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
                        {alert.title}
                      </span>
                      <Badge 
                        variant="outline"
                        className="text-xs"
                        style={{
                          color: alert.color,
                          borderColor: alert.color,
                          backgroundColor: 'transparent'
                        }}
                      >
                        {alert.count}
                      </Badge>
                    </div>
                    <p className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
                      {alert.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" style={{color: 'oklch(0.35 0.04 240)'}} />
              </div>
            );
          })}
        </div>

        {/* Priority Actions */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3" style={{color: 'oklch(0.25 0.08 240)'}}>
            Priority Actions:
          </h4>
          <div className="space-y-2">
            {priorityActions.map((action) => (
              <div 
                key={action.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: action.urgency === 'critical' ? 'oklch(0.60 0.20 20)' : 'oklch(0.70 0.18 50)'
                    }}
                  ></div>
                  <span className="text-sm" style={{color: 'oklch(0.1 0.1 240)'}}>
                    {action.action}: {action.vendor}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>
                    {action.amount}
                  </div>
                  <div className="text-xs" style={{color: 'oklch(0.60 0.20 20)'}}>
                    {action.daysOverdue} days
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            size="sm" 
            className="text-white"
            style={{
              backgroundColor: 'oklch(0.25 0.08 240)',
              borderColor: 'oklch(0.25 0.08 240)'
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            style={{
              color: 'oklch(0.25 0.08 240)',
              borderColor: 'oklch(0.75 0.06 240)'
            }}
          >
            Generate Report
          </Button>
        </div>

        {/* Status Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Total Alerts</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.60 0.20 20)'}}>{totalAlerts}</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Resolved Today</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.65 0.12 140)'}}>{resolvedToday}</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Response Time</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.45 0.12 200)'}}>{responseTime}</div>
            </div>
          </div>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}