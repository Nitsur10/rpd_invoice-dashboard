'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Upload,
  Send,
  Eye
} from 'lucide-react';
import { getAPIInvoiceData } from '@/lib/api-chart-data';
import { useDateFilter } from '@/contexts/date-filter-context';
import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';

// Generate real activity from invoice data using snake_case field names
function generateRecentActivity(invoices: Invoice[]) {
  const activities: any[] = [];
  
  // Get recent invoices sorted by date using snake_case field names
  const sortedInvoices = invoices
    .sort((a, b) => {
      const aDate = new Date(a.received_date || a.created_at || 0);
      const bDate = new Date(b.received_date || b.created_at || 0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 10);
  
  sortedInvoices.forEach((invoice, index) => {
    const receivedDate = new Date(invoice.received_date || invoice.created_at || 0);
    const daysSince = Math.floor((Date.now() - receivedDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeAgo = daysSince === 0 ? 'Today' : 
                   daysSince === 1 ? '1 day ago' : 
                   daysSince < 7 ? `${daysSince} days ago` : 
                   daysSince < 30 ? `${Math.floor(daysSince / 7)} weeks ago` : 
                   `${Math.floor(daysSince / 30)} months ago`;
    
    if (invoice.payment_status === 'paid') {
      activities.push({
        id: `paid-${invoice.id}`,
        type: 'payment_received',
        title: 'Payment received',
        description: `${invoice.supplier_name} - $${(invoice.total || 0).toLocaleString()}`,
        time: timeAgo,
        icon: CheckCircle,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        priority: 'normal'
      });
    } else if (invoice.payment_status === 'overdue') {
      activities.push({
        id: `overdue-${invoice.id}`,
        type: 'payment_overdue',
        title: 'Payment overdue',
        description: `${invoice.supplier_name} - ${invoice.invoice_number}`,
        time: timeAgo,
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        priority: 'high'
      });
    } else {
      activities.push({
        id: `pending-${invoice.id}`,
        type: 'invoice_processed',
        title: 'Invoice processed',
        description: `${invoice.supplier_name} - $${(invoice.total || 0).toLocaleString()}`,
        time: timeAgo,
        icon: FileText,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        priority: 'normal'
      });
    }
  });
  
  return activities.slice(0, 5);
}

export function RecentActivityFeed() {
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
        console.error('Error loading activity data:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange]);
  
  const recentActivities = generateRecentActivity(invoices);
  
  // Calculate real statistics using snake_case field names
  const todayActivities = invoices.filter(inv => {
    const receivedDate = new Date(inv.received_date || inv.created_at || 0);
    const today = new Date();
    return receivedDate.toDateString() === today.toDateString();
  }).length;
  
  const urgentCount = invoices.filter(inv => inv.payment_status === 'overdue').length;
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span style={{color: 'oklch(0.1 0.1 240)'}}>Recent Activity</span>
          <Badge 
            variant="outline"
            className="text-xs"
            style={{
              color: 'oklch(0.35 0.08 200)',
              borderColor: 'oklch(0.75 0.06 200)',
              backgroundColor: 'oklch(0.90 0.04 200)'
            }}
          >
            Live
          </Badge>
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Real-time invoice and payment activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading recent activity...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
          {recentActivities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 group hover:bg-slate-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-full ${activity.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate" style={{color: 'oklch(0.1 0.1 240)'}}>
                      {activity.title}
                    </p>
                    {activity.priority === 'high' && (
                      <Badge 
                        variant="outline"
                        className="text-xs ml-2"
                        style={{
                          color: 'oklch(0.60 0.20 20)',
                          borderColor: 'oklch(0.60 0.20 20)',
                          backgroundColor: 'oklch(0.60 0.20 20 / 0.1)'
                        }}
                      >
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm truncate" style={{color: 'oklch(0.25 0.06 240)'}}>
                    {activity.description}
                  </p>
                  <p className="text-xs mt-1" style={{color: 'oklch(0.35 0.04 240)'}}>
                    {activity.time}
                  </p>
                </div>
                
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" style={{color: 'oklch(0.35 0.04 240)'}} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button 
            variant="ghost" 
            className="w-full text-center text-sm font-medium transition-colors hover:opacity-80" 
            style={{color: 'oklch(0.25 0.08 240)'}}
          >
            View all activity →
          </Button>
        </div>
        
        {/* Activity Summary - Real Data */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Today</div>
              <div style={{color: 'oklch(0.35 0.04 240)'}}>{todayActivities} activities</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Overdue</div>
              <div style={{color: urgentCount > 0 ? 'oklch(0.60 0.20 20)' : 'oklch(0.35 0.04 240)'}}>{urgentCount} items</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Total</div>
              <div style={{color: 'oklch(0.35 0.04 240)'}}>{invoices.length} invoices</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}