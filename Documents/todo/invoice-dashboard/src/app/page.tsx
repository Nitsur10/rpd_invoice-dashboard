'use client';

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              onClick={() => window.location.href = '/invoices'}
            >
              <Activity className="h-4 w-4" />
              <span>View Invoice Dashboard</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <Plus className="h-4 w-4" />
              <span>SharePoint Auto-Sync Active</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <Users className="h-4 w-4" />
              <span>Rudra Projects Team</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Bottom Row - Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg. Processing Time</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">2.3 days</p>
              </div>
              <div className="p-2 bg-purple-600 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200/50 dark:border-cyan-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Success Rate</p>
                <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">98.7%</p>
              </div>
              <div className="p-2 bg-cyan-600 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Payment Rate</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">87.4%</p>
              </div>
              <div className="p-2 bg-green-600 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50 dark:border-orange-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Vendors</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">47</p>
              </div>
              <div className="p-2 bg-orange-600 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
