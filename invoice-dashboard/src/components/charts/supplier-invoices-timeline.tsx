'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getConsolidatedInvoiceData } from '@/lib/real-consolidated-data';
import { useDateFilter } from '@/contexts/date-filter-context';

// Generate supplier timeline data from real invoices
function generateSupplierTimelineData() {
  const invoices = getConsolidatedInvoiceData();
  
  // Group invoices by month and supplier
  const monthlyData: Record<string, any> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.issueDate);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
    const monthLabel = date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthLabel,
        monthKey,
        suppliers: {} as Record<string, { count: number; amount: number }>
      };
    }
    
    const supplier = invoice.vendorName;
    if (!monthlyData[monthKey].suppliers[supplier]) {
      monthlyData[monthKey].suppliers[supplier] = {
        count: 0,
        amount: 0
      };
    }
    
    monthlyData[monthKey].suppliers[supplier].count++;
    monthlyData[monthKey].suppliers[supplier].amount += invoice.amount;
  });
  
  // Get top 5 suppliers by total invoice count
  const supplierTotals: Record<string, { count: number; amount: number }> = {};
  Object.values(monthlyData).forEach((month: any) => {
    Object.entries(month.suppliers).forEach(([supplier, data]: [string, any]) => {
      if (!supplierTotals[supplier]) {
        supplierTotals[supplier] = { count: 0, amount: 0 };
      }
      supplierTotals[supplier].count += data.count;
      supplierTotals[supplier].amount += data.amount;
    });
  });
  
  const topSuppliers = Object.entries(supplierTotals)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 5)
    .map(([supplier]) => supplier);
  
  // Create timeline data
  const timelineData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.monthKey.localeCompare(b.monthKey))
    .map((month: any) => {
      const dataPoint: Record<string, any> = { month: month.month };
      
      topSuppliers.forEach(supplier => {
        const supplierData = month.suppliers[supplier];
        dataPoint[supplier] = supplierData ? supplierData.count : 0;
      });
      
      return dataPoint;
    });
  
  return { timelineData, topSuppliers, supplierTotals };
}

// Generate colors for suppliers
const supplierColors = [
  'oklch(0.45 0.12 200)',  // Blue
  'oklch(0.65 0.12 140)',  // Green
  'oklch(0.70 0.18 50)',   // Orange
  'oklch(0.55 0.15 280)',  // Purple
  'oklch(0.60 0.20 20)',   // Red
];

export function SupplierInvoicesTimeline() {
  const { dateRange } = useDateFilter();
  const { timelineData, topSuppliers, supplierTotals } = generateSupplierTimelineData();
  
  // Apply date filtering to timeline data
  const filteredData = timelineData.filter(item => {
    if (!dateRange.from && !dateRange.to) return true;
    
    // Parse month from display format (e.g., "May 2025")
    const monthDate = new Date(item.month + ' 01');
    
    if (dateRange.from && monthDate < dateRange.from) return false;
    if (dateRange.to && monthDate > dateRange.to) return false;
    
    return true;
  });

  // Calculate stats
  const totalSuppliers = Object.keys(supplierTotals).length;
  const topSupplierName = topSuppliers.length > 0 ? topSuppliers[0] : 'N/A';
  const displayName = topSupplierName.length > 15 ? topSupplierName.substring(0, 15) + '...' : topSupplierName;
  const totalCount = Object.values(supplierTotals).reduce((sum, data) => sum + data.count, 0);
  const avgPerMonth = filteredData.length > 0 ? Math.round(totalCount / filteredData.length) : 0;
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Supplier Invoices Timeline
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Invoice volume by top suppliers over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Top Suppliers Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topSuppliers.map((supplier, index) => (
            <Badge 
              key={supplier}
              variant="outline"
              className="text-xs"
              style={{
                color: supplierColors[index],
                borderColor: supplierColors[index],
                backgroundColor: `${supplierColors[index]}15`
              }}
            >
              {supplier.length > 20 ? supplier.substring(0, 20) + '...' : supplier}
              <span className="ml-1 font-bold">
                ({supplierTotals[supplier].count})
              </span>
            </Badge>
          ))}
        </div>
        
        {/* Timeline Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="oklch(0.85 0.04 240)"
                strokeOpacity={0.3}
              />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'oklch(0.35 0.04 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'oklch(0.35 0.04 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                label={{ 
                  value: 'Number of Invoices', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'oklch(0.35 0.04 240)', fontSize: '12px' }
                }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'oklch(0.98 0.01 240)',
                  border: '1px solid oklch(0.85 0.04 240)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'oklch(0.1 0.1 240)', fontWeight: 'bold' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              
              {topSuppliers.map((supplier, index) => (
                <Line
                  key={supplier}
                  type="monotone"
                  dataKey={supplier}
                  name={supplier.length > 25 ? supplier.substring(0, 25) + '...' : supplier}
                  stroke={supplierColors[index]}
                  strokeWidth={2}
                  dot={{ fill: supplierColors[index], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: supplierColors[index], strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Total Suppliers</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.45 0.12 200)'}}>{totalSuppliers}</div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Top Supplier</div>
              <div className="text-sm font-bold" style={{color: 'oklch(0.65 0.12 140)'}}>
                {displayName}
              </div>
            </div>
            <div>
              <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Avg per Month</div>
              <div className="text-lg font-bold" style={{color: 'oklch(0.55 0.15 280)'}}>{avgPerMonth}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}