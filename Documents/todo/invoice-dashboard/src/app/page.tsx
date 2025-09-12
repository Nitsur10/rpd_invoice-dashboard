'use client';

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
// Charts (replacing quick actions and activity)
import { CategoryBreakdown } from '@/components/charts/category-breakdown';
import { TopVendors } from '@/components/charts/top-vendors';
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
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/lib/api/stats';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatDateForSydney(new Date()));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const statsQ = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetchDashboardStats();
      return res.data;
    },
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
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
              {currentTime}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button size="sm" className="space-x-2 shadow-lg text-white" 
                  style={{
                    background: 'oklch(0.25 0.08 240)',
                    boxShadow: '0 4px 6px -1px oklch(0.25 0.08 240 / 0.3)'
                  }}>
            <Plus className="h-4 w-4" />
            <span>Add Invoice</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsQ.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}
      {statsQ.error && (
        <div className="text-sm text-red-600 dark:text-red-400">Failed to load dashboard stats.</div>
      )}
      {mappedStats && <StatsCards stats={mappedStats} />}

      {/* Charts Grid (replaces quick actions, recent activity, and bottom cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown />
        <TopVendors />
      </div>
    </div>
  );
}
