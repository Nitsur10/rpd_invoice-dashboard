'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Upload
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'invoice_processed',
    title: 'Invoice INV-2024-001 processed',
    description: 'Test Corporation - $1,250.00',
    time: '2 minutes ago',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 2,
    type: 'payment_overdue',
    title: 'Payment overdue alert',
    description: 'ABC Services - STMT-2024-01',
    time: '15 minutes ago',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 3,
    type: 'new_invoice',
    title: 'New invoice received',
    description: 'Professional Consulting - $2,750.00',
    time: '1 hour ago',
    icon: FileText,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 4,
    type: 'data_import',
    title: 'CSV data imported',
    description: '247 invoices processed successfully',
    time: '2 hours ago',
    icon: Upload,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 5,
    type: 'payment_pending',
    title: 'Payment due reminder',
    description: 'City Utilities - UTIL-2024-01',
    time: '4 hours ago',
    icon: Clock,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
];

export function RecentActivity() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Recent Activity
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Latest updates and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 group hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
                <div className={`p-2 rounded-full ${activity.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{color: 'oklch(0.1 0.1 240)'}}>
                    {activity.title}
                  </p>
                  <p className="text-sm truncate" style={{color: 'oklch(0.25 0.06 240)'}}>
                    {activity.description}
                  </p>
                  <p className="text-xs mt-1" style={{color: 'oklch(0.35 0.04 240)'}}>
                    {activity.time}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button className="w-full text-center text-sm font-medium transition-colors hover:opacity-80" style={{color: 'oklch(0.25 0.08 240)'}}>
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}