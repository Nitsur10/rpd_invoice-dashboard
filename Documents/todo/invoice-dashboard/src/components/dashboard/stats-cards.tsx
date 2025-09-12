'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cardVariants, iconVariants, badgeVariants } from '@/lib/variants';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/lib/api/stats';

interface StatsCardsProps {
  dateFrom?: string;
  dateTo?: string;
}

export function StatsCards({ dateFrom, dateTo }: StatsCardsProps) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', { dateFrom, dateTo }],
    queryFn: () => fetchDashboardStats({ dateFrom, dateTo }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load dashboard statistics</p>
            <p className="text-sm text-slate-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;
  const cards = [
    {
      id: 'total-invoices',
      title: 'Total Invoices',
      value: stats.overview.totalInvoices.toLocaleString(),
      icon: FileText,
      trend: `${stats.overview.trends.invoices > 0 ? '+' : ''}${stats.overview.trends.invoices.toFixed(1)}%`,
      trendUp: stats.overview.trends.invoices > 0,
      type: 'primary' as const,
    },
    {
      id: 'total-amount',
      title: 'Total Amount',
      value: `$${stats.overview.totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: `${stats.overview.trends.amount > 0 ? '+' : ''}${stats.overview.trends.amount.toFixed(1)}%`,
      trendUp: stats.overview.trends.amount > 0,
      type: 'success' as const,
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: stats.overview.pendingPayments.toLocaleString(),
      icon: Clock,
      trend: `$${stats.overview.pendingAmount.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      trendUp: false,
      type: 'warning' as const,
    },
    {
      id: 'overdue-items',
      title: 'Overdue Items',
      value: stats.overview.overduePayments.toLocaleString(),
      icon: AlertTriangle,
      trend: `$${stats.overview.overdueAmount.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`,
      trendUp: stats.overview.overduePayments > 0,
      type: 'danger' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendUp ? TrendingUp : TrendingDown;
        
        const cardStyle = {
          primary: {
            background: 'linear-gradient(135deg, oklch(0.25 0.08 240 / 0.1), oklch(0.35 0.08 240 / 0.05))',
            borderColor: 'oklch(0.25 0.08 240 / 0.2)',
            iconBg: 'linear-gradient(135deg, oklch(0.25 0.08 240), oklch(0.35 0.08 240))'
          },
          success: {
            background: 'linear-gradient(135deg, oklch(0.65 0.12 80 / 0.1), oklch(0.75 0.12 80 / 0.05))',
            borderColor: 'oklch(0.65 0.12 80 / 0.2)', 
            iconBg: 'linear-gradient(135deg, oklch(0.65 0.12 80), oklch(0.75 0.12 80))'
          },
          warning: {
            background: 'linear-gradient(135deg, oklch(0.70 0.18 50 / 0.1), oklch(0.80 0.18 50 / 0.05))',
            borderColor: 'oklch(0.70 0.18 50 / 0.2)',
            iconBg: 'linear-gradient(135deg, oklch(0.70 0.18 50), oklch(0.80 0.18 50))'
          },
          danger: {
            background: 'linear-gradient(135deg, oklch(0.60 0.20 20 / 0.1), oklch(0.70 0.20 20 / 0.05))',
            borderColor: 'oklch(0.60 0.20 20 / 0.2)',
            iconBg: 'linear-gradient(135deg, oklch(0.60 0.20 20), oklch(0.70 0.20 20))'
          }
        };
        
        return (
          <Card 
            key={card.id}
            className="glass-card glass-card-hover group cursor-pointer relative overflow-hidden border"
            style={{
              background: cardStyle[card.type].background,
              borderColor: cardStyle[card.type].borderColor
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 animated-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            
            {/* Ripple effect */}
            <div className="absolute inset-0 scale-0 bg-white/10 dark:bg-black/10 rounded-lg group-active:scale-100 transition-transform duration-200 ease-out" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-lg shadow-md group-hover:scale-110 transition-all duration-300 ease-out floating"
                   style={{
                     background: cardStyle[card.type].iconBg
                   }}>
                <Icon className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:scale-105 transition-transform duration-300 ease-out">
                  {card.value}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`flex items-center space-x-1 px-2 py-1 group-hover:pulse-glow transition-all duration-300 ${
                      card.trendUp 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30' 
                        : 'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/30'
                    }`}
                  >
                    <TrendIcon className={`h-3 w-3 transition-all duration-300 ${card.trendUp ? 'group-hover:animate-bounce' : 'group-hover:animate-pulse'}`} />
                    <span className="text-xs font-medium">{card.trend}</span>
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    vs last month
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}