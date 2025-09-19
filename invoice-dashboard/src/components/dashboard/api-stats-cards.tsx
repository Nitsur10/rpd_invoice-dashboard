'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cardVariants, iconVariants, badgeVariants } from '@/lib/variants';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import {
  fetchDashboardStats,
  DashboardStatsAPI,
  APIError,
  handleAPIError
} from '@/lib/api-client';
import { formatCurrency } from '@/lib/data';

interface APIStatsCardsProps {
  dateFrom?: string;
  dateTo?: string;
}

export function APIStatsCards({ dateFrom, dateTo }: APIStatsCardsProps) {
  const [stats, setStats] = useState<DashboardStatsAPI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<APIError | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchDashboardStats(dateFrom, dateTo);
        if (!isActive) return;
        setStats(response);
      } catch (err) {
        if (!isActive) return;
        const apiError = handleAPIError(err);
        setError(apiError);
        setStats(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isActive = false;
    };
  }, [dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className={cn(cardVariants())}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cn(cardVariants())}>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error?.message || 'Failed to load statistics'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTrend = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Total Invoices',
      value: stats.overview.totalInvoices.toString(),
      icon: FileText,
      trend: formatTrend(stats.overview.trends.invoices),
      trendUp: stats.overview.trends.invoices >= 0,
      color: 'oklch(0.25 0.08 240)' // Navy blue
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats.overview.totalAmount),
      icon: DollarSign,
      trend: formatTrend(stats.overview.trends.amount),
      trendUp: stats.overview.trends.amount >= 0,
      color: 'oklch(0.45 0.15 142)' // Gold
    },
    {
      title: 'Pending Payments',
      value: stats.overview.pendingPayments.toString(),
      icon: Clock,
      trend: `${formatCurrency(stats.overview.pendingAmount)}`,
      trendUp: false, // Neutral for amount display
      color: 'oklch(0.65 0.15 60)' // Warning yellow
    },
    {
      title: 'Overdue',
      value: stats.overview.overduePayments.toString(),
      icon: AlertTriangle,
      trend: `${formatCurrency(stats.overview.overdueAmount)}`,
      trendUp: false, // Red for overdue
      color: stats.overview.overduePayments > 0 ? 'oklch(0.55 0.15 25)' : 'oklch(0.65 0.15 145)' // Red if overdue, green if none
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className={cn(cardVariants())}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <IconComponent 
                className={cn(iconVariants())} 
                style={{ color: card.color }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {card.title !== 'Pending Payments' && card.title !== 'Overdue' ? (
                  <>
                    {card.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <Badge 
                      variant={card.trendUp ? 'default' : 'destructive'}
                      className={cn(badgeVariants({ variant: card.trendUp ? 'default' : 'destructive' }))}
                    >
                      {card.trend}
                    </Badge>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {card.trend}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Backward compatibility wrapper
export function StatsCards({ stats }: { stats?: any }) {
  return <APIStatsCards />;
}