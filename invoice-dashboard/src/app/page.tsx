'use client';

import { useState, useEffect } from 'react';
import { APIStatsCards } from '@/components/dashboard/api-stats-cards';
import { InvoiceProcessingTime } from '@/components/charts/invoice-processing-time';
import { PaymentStatusBreakdown } from '@/components/charts/payment-status-breakdown';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { CriticalAlerts } from '@/components/dashboard/critical-alerts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';
import { DateFilterProvider, useDateFilter } from '@/contexts/date-filter-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users,
  CreditCard,
  Activity
} from 'lucide-react';
import { formatDateForSydney } from '@/lib/data';

function DashboardContent() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { dateRange, setDateRange } = useDateFilter();

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatDateForSydney(new Date()));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold" style={{color: 'oklch(0.25 0.08 240)'}}>
            RPD Invoice Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your invoices today.
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Calendar className="h-4 w-4" style={{color: 'oklch(0.25 0.08 240)'}} />
            <span className="text-sm font-mono" style={{color: 'oklch(0.25 0.08 240)'}}>
              {currentTime}
            </span>
          </div>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>
            Filter Period:
          </div>
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <APIStatsCards 
        dateFrom={dateRange.from?.toISOString()} 
        dateTo={dateRange.to?.toISOString()} 
      />

      {/* Charts Grid - Operational Insights & Business Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceProcessingTime />
        <PaymentStatusBreakdown />
      </div>

      {/* Recent Activity & Critical Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityFeed />
        <CriticalAlerts />
        <QuickActions />
      </div>

    </div>
  );
}

export default function Dashboard() {
  return (
    <DateFilterProvider>
      <DashboardContent />
    </DateFilterProvider>
  );
}
