'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTopOutstandingInvoices } from '@/lib/real-consolidated-data';
import { useDateFilter } from '@/contexts/date-filter-context';


const getStatusColor = (status: string, daysOverdue: number) => {
  if (status === 'overdue' && daysOverdue > 20) {
    return 'oklch(0.60 0.20 20)'; // Dark red for severely overdue
  } else if (status === 'overdue') {
    return 'oklch(0.70 0.18 50)'; // Orange for overdue
  } else {
    return 'oklch(0.45 0.12 200)'; // Blue for pending
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-4 border shadow-lg max-w-56">
        <p className="font-medium mb-2" style={{color: 'oklch(0.1 0.1 240)'}}>
          {data.vendor}
        </p>
        <div className="space-y-1 text-xs" style={{color: 'oklch(0.25 0.06 240)'}}>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">${data.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice ID:</span>
            <span className="font-medium">{data.invoiceId}</span>
          </div>
          <div className="flex justify-between">
            <span>Days:</span>
            <span className="font-medium">
              {data.status === 'overdue' ? `${data.daysOverdue} overdue` : `${data.daysOverdue} pending`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge 
              variant="outline"
              className="text-xs"
              style={{
                color: getStatusColor(data.status, data.daysOverdue),
                borderColor: getStatusColor(data.status, data.daysOverdue),
                backgroundColor: `${getStatusColor(data.status, data.daysOverdue)}15`
              }}
            >
              {data.status === 'overdue' ? 'Overdue' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TopOutstandingInvoices() {
  const { dateRange } = useDateFilter();
  const rawData = getTopOutstandingInvoices(dateRange.from, dateRange.to);
  const outstandingInvoicesData = rawData.map((invoice, index) => ({
    vendor: invoice.vendor.length > 20 ? invoice.vendor.substring(0, 18) + '...' : invoice.vendor,
    fullVendor: invoice.vendor,
    amount: invoice.amount,
    daysOverdue: invoice.daysOverdue,
    invoiceId: `Top-${index + 1}`,
    status: invoice.daysOverdue > 0 ? 'overdue' : 'pending'
  }));
  const totalOutstanding = outstandingInvoicesData.reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueCount = outstandingInvoicesData.filter(invoice => invoice.status === 'overdue').length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Top 10 Outstanding Invoices
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Largest unpaid invoices requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={outstandingInvoicesData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.04 240)" opacity={0.3} />
              <XAxis 
                type="number"
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <YAxis 
                type="category"
                dataKey="vendor"
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 10 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                width={95}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {outstandingInvoicesData.map((entry, index) => (
                  <Bar 
                    key={`bar-${index}`}
                    fill={getStatusColor(entry.status, entry.daysOverdue)}
                    stroke="oklch(0.95 0.02 240)"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-center">
          <div>
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Total Outstanding</div>
            <div className="text-lg font-bold" style={{color: 'oklch(0.1 0.1 240)'}}>
              ${totalOutstanding.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Overdue Items</div>
            <div className="text-lg font-bold" style={{color: 'oklch(0.60 0.20 20)'}}>
              {overdueCount}
            </div>
          </div>
          <div>
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Largest Invoice</div>
            <div className="text-lg font-bold" style={{color: 'oklch(0.35 0.04 240)'}}>
              ${outstandingInvoicesData[0].amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" style={{backgroundColor: 'oklch(0.45 0.12 200)'}}></div>
            <span style={{color: 'oklch(0.35 0.04 240)'}}>Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" style={{backgroundColor: 'oklch(0.70 0.18 50)'}}></div>
            <span style={{color: 'oklch(0.35 0.04 240)'}}>Overdue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded" style={{backgroundColor: 'oklch(0.60 0.20 20)'}}></div>
            <span style={{color: 'oklch(0.35 0.04 240)'}}>Severely Overdue</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}