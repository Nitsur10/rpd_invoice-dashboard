'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAPIPaymentStatusBreakdown } from '@/lib/api-chart-data';
import { useDateFilter } from '@/contexts/date-filter-context';
import { useState, useEffect } from 'react';


// OKLCH color palette for status indicators
const STATUS_COLORS = {
  'Paid': 'oklch(0.65 0.12 140)',     // Green
  'Pending': 'oklch(0.45 0.12 200)',  // Blue
  'Overdue': 'oklch(0.60 0.20 20)',   // Red
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-4 border shadow-lg">
        <p className="font-medium mb-2" style={{color: 'oklch(0.1 0.1 240)'}}>
          {data.name} Invoices
        </p>
        <div className="space-y-1 text-sm" style={{color: 'oklch(0.25 0.06 240)'}}>
          <div className="flex justify-between">
            <span>Count:</span>
            <span className="font-medium">{data.count} invoices</span>
          </div>
          <div className="flex justify-between">
            <span>Percentage:</span>
            <span className="font-medium">{data.value}%</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-medium">${data.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg per Invoice:</span>
            <span className="font-medium">${Math.round(data.amount / data.count).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ 
              backgroundColor: entry.color,
              borderColor: 'oklch(0.85 0.04 240)'
            }}
          />
          <div className="text-center">
            <div className="text-sm font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
              {entry.value}
            </div>
            <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
              {entry.payload.count} ({entry.payload.value}%)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function PaymentStatusBreakdown() {
  const { dateRange } = useDateFilter();
  const [paymentStatusData, setPaymentStatusData] = useState<Array<{name: string, value: number, count: number, amount: number}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getAPIPaymentStatusBreakdown(dateRange.from, dateRange.to);
        setPaymentStatusData(data);
      } catch (error) {
        console.error('Error loading payment status data:', error);
        setPaymentStatusData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange]);
  
  const totalAmount = paymentStatusData.reduce((sum, item) => sum + item.amount, 0);
  const totalInvoices = paymentStatusData.reduce((sum, item) => sum + item.count, 0);
  const paidAmount = paymentStatusData.find(item => item.name === 'Paid')?.amount || 0;
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Payment Status Breakdown
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Current status of all invoices by payment state
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading payment status data...</p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="oklch(0.95 0.02 240)"
                strokeWidth={2}
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        )}
        
        {/* Key Performance Indicators */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{color: 'oklch(0.65 0.12 140)'}}>
              {collectionRate}%
            </div>
            <div className="text-xs font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>
              Collection Rate
            </div>
            <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
              ${paidAmount.toLocaleString()} collected
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold" style={{color: 'oklch(0.1 0.1 240)'}}>
              {totalInvoices}
            </div>
            <div className="text-xs font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>
              Total Invoices
            </div>
            <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
              ${totalAmount.toLocaleString()} total value
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            {paymentStatusData.map((statusData, index) => {
              const statusColorKey = statusData.name as keyof typeof STATUS_COLORS;
              return (
                <div key={statusData.name}>
                  <Badge 
                    variant="outline"
                    className="w-full justify-center mb-1"
                    style={{
                      color: STATUS_COLORS[statusColorKey],
                      borderColor: STATUS_COLORS[statusColorKey],
                      backgroundColor: `${STATUS_COLORS[statusColorKey]}15`
                    }}
                  >
                    {statusData.name}
                  </Badge>
                  <div style={{color: 'oklch(0.35 0.04 240)'}}>
                    ${statusData.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}