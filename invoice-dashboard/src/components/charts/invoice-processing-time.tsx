'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAPIProcessingTimeStats } from '@/lib/api-chart-data';
import { useDateFilter } from '@/contexts/date-filter-context';
import { useState, useEffect } from 'react';


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border shadow-lg">
        <p className="font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
          {label}
        </p>
        <p className="text-sm" style={{color: 'oklch(0.25 0.06 240)'}}>
          Count: {payload[0].value} invoices ({payload[0].payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function InvoiceProcessingTime() {
  const { dateRange } = useDateFilter();
  const [processingTimeData, setProcessingTimeData] = useState<Array<{range: string, count: number, percentage: number}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const stats = await getAPIProcessingTimeStats(dateRange.from, dateRange.to);
        const totalCount = stats.reduce((sum, x) => sum + x.count, 0);
        const data = stats.map(item => ({
          range: item.timeRange,
          count: item.count,
          percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
        }));
        setProcessingTimeData(data);
      } catch (error) {
        console.error('Error loading processing time data:', error);
        setProcessingTimeData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange]);
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Invoice Processing Time
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Distribution of processing times across all invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading processing time data...</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processingTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.04 240)" opacity={0.3} />
              <XAxis 
                dataKey="range" 
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
              />
              <YAxis 
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#processingGradient)"
                radius={[4, 4, 0, 0]}
                stroke="oklch(0.25 0.08 240)"
                strokeWidth={1}
              />
              <defs>
                <linearGradient id="processingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.45 0.12 240)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="oklch(0.25 0.08 240)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
        
        <div className="mt-4 flex justify-between text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
          <span>Avg: 3.2 days</span>
          <span>Median: 3 days</span>
          <span>90th percentile: 7 days</span>
        </div>
      </CardContent>
    </Card>
  );
}