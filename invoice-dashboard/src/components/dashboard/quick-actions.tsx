'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Download, 
  FileText, 
  RefreshCw,
  Send,
  BarChart3,
  Settings,
  CheckCircle,
  Clock
} from 'lucide-react';

const quickActions = [
  {
    id: 1,
    title: 'Export Outstanding Report',
    description: 'PDF & Excel formats',
    icon: Download,
    color: 'oklch(0.45 0.12 200)',
    bgColor: 'oklch(0.45 0.12 200 / 0.1)',
    action: 'export_report',
    count: null
  },
  {
    id: 2,
    title: 'Generate Invoice Summary',
    description: 'Monthly overview',
    icon: FileText,
    color: 'oklch(0.65 0.12 140)',
    bgColor: 'oklch(0.65 0.12 140 / 0.1)',
    action: 'generate_summary',
    count: null
  },
  {
    id: 3,
    title: 'Refresh All Data',
    description: 'Sync with SharePoint',
    icon: RefreshCw,
    color: 'oklch(0.55 0.15 280)',
    bgColor: 'oklch(0.55 0.15 280 / 0.1)',
    action: 'refresh_data',
    count: null
  }
];

const systemStatus = {
  autoSync: {
    status: 'active',
    lastUpdate: '2 min ago',
    nextSync: '15:30 AEST',
    color: 'oklch(0.65 0.12 140)'
  },
  sharepoint: {
    status: 'connected',
    invoicesCount: 247,
    lastSync: '14:28 AEST',
    color: 'oklch(0.45 0.12 200)'
  },
  alerts: {
    enabled: true,
    activeAlerts: 15,
    lastAlert: '5 min ago',
    color: 'oklch(0.70 0.18 50)'
  }
};

export function QuickActions() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Quick Actions
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Common tasks and system controls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start p-4 h-auto hover:shadow-md transition-all duration-200"
                style={{
                  borderColor: 'oklch(0.85 0.04 240)',
                  backgroundColor: 'oklch(0.98 0.01 240)'
                }}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: action.bgColor,
                      border: `1px solid ${action.color}20`
                    }}
                  >
                    <Icon className="h-4 w-4" style={{color: action.color}} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
                        {action.title}
                      </span>
                      {action.count && (
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{
                            color: action.color,
                            borderColor: action.color,
                            backgroundColor: 'transparent'
                          }}
                        >
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{color: 'oklch(0.35 0.04 240)'}}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>
            System Status
          </h4>
          
          {/* Auto-Sync Status */}
          <div className="flex items-center justify-between p-3 rounded-lg border" 
               style={{borderColor: 'oklch(0.85 0.04 240)', backgroundColor: 'oklch(0.98 0.01 240)'}}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" style={{color: systemStatus.autoSync.color}} />
                <span className="text-sm font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
                  Auto-Sync
                </span>
              </div>
              <Badge 
                variant="outline"
                className="text-xs"
                style={{
                  color: systemStatus.autoSync.color,
                  borderColor: systemStatus.autoSync.color,
                  backgroundColor: `${systemStatus.autoSync.color}15`
                }}
              >
                Active
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
                Last: {systemStatus.autoSync.lastUpdate}
              </div>
              <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
                Next: {systemStatus.autoSync.nextSync}
              </div>
            </div>
          </div>

          {/* SharePoint Connection */}
          <div className="flex items-center justify-between p-3 rounded-lg border"
               style={{borderColor: 'oklch(0.85 0.04 240)', backgroundColor: 'oklch(0.98 0.01 240)'}}>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: systemStatus.sharepoint.color}}></div>
                <span className="text-sm font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
                  SharePoint
                </span>
              </div>
              <Badge 
                variant="outline"
                className="text-xs"
                style={{
                  color: systemStatus.sharepoint.color,
                  borderColor: systemStatus.sharepoint.color,
                  backgroundColor: `${systemStatus.sharepoint.color}15`
                }}
              >
                Connected
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>
                {systemStatus.sharepoint.invoicesCount} invoices
              </div>
              <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
                Synced: {systemStatus.sharepoint.lastSync}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Actions Today</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.1 0.1 240)'}}>8</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Data Syncs</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.65 0.12 140)'}}>12</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Reports Generated</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.45 0.12 200)'}}>3</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}