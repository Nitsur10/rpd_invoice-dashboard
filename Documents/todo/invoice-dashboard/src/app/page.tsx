'use client';

import { useEffect, useState, memo } from 'react';
import dynamic from 'next/dynamic';
import { StatsCards } from '@/components/dashboard/stats-cards';
// Charts (lazy client-only to avoid hydration cost)
const CategoryBreakdown = dynamic(() => import('@/components/charts/category-breakdown').then(m => m.CategoryBreakdown), { 
  ssr: false, 
  loading: () => (
    <Card className="rpd-card-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </CardContent>
    </Card>
  )
});
const TopVendors = dynamic(() => import('@/components/charts/top-vendors').then(m => m.TopVendors), { 
  ssr: false, 
  loading: () => (
    <Card className="rpd-card-elevated">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </CardContent>
    </Card>
  )
});
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Users,
  CreditCard,
  Activity
} from 'lucide-react';
import { formatDateForSydney } from '@/lib/data';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/lib/api/stats';

function Clock() {
  const [now, setNow] = useState<string>('');
  useEffect(() => {
    const id = setInterval(() => setNow(formatDateForSydney(new Date())), 1000);
    setNow(formatDateForSydney(new Date()));
    return () => clearInterval(id);
  }, []);
  return <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{now}</span>;
}

export default function Dashboard() {

  const statsQ = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchDashboardStats(),
    staleTime: 5 * 60 * 1000,
  });

  // Map API stats to existing StatsCards props
  const mappedStats = statsQ.data ? {
    totalInvoices: statsQ.data.overview.totalInvoices,
    totalAmount: statsQ.data.overview.totalAmount,
    pendingPayments: statsQ.data.overview.pendingPayments,
    overduePayments: statsQ.data.overview.overduePayments,
    paidAmount: statsQ.data.overview.paidAmount,
    averageAmount: statsQ.data.overview.totalAmount / Math.max(1, statsQ.data.overview.totalInvoices),
  } : undefined;

  return (
    <div className="rpd-gradient-bg min-h-screen">
      <div className="rpd-container rpd-section-padding space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="rpd-heading-xl rpd-text-gradient mb-2">
              RPD Invoice Dashboard
            </h1>
            <p className="rpd-body-lg text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your invoices today.
            </p>
            <div className="flex items-center space-x-2 mt-3">
              <Calendar className="h-4 w-4 text-primary" />
              <Clock />
            </div>
          </div>
        
          <div className="flex space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rpd-btn-secondary space-x-2 border hover:border-primary">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    className="w-full"
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    className="w-full"
                    placeholder="Select end date"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="rpd-btn-primary flex-1">
                    Apply Filter
                  </Button>
                  <Button variant="outline" size="sm" className="rpd-btn-secondary flex-1">
                    Clear
                  </Button>
                </div>
              </div>
            </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Cards */}
        {statsQ.isLoading && (
          <div className="rpd-grid-responsive">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rpd-card h-32 rpd-skeleton" />
            ))}
          </div>
        )}
        {statsQ.error && (
          <div className="rpd-card-elevated p-6 border-red-800/30">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-400" />
              <span className="rpd-body text-red-400">Failed to load dashboard stats.</span>
            </div>
          </div>
        )}
        {mappedStats && <StatsCards stats={mappedStats} />}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-fade-in">
            <CategoryBreakdown 
              data={statsQ.data?.breakdowns.categories ?? []}
              isLoading={statsQ.isLoading}
            />
          </div>
          <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
            <TopVendors 
              data={statsQ.data?.breakdowns.topVendors ?? []}
              isLoading={statsQ.isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
