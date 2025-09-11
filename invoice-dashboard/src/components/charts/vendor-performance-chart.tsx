'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for vendor performance (payment speed vs reliability)
const vendorPerformanceData = [
  { vendor: 'Professional Consulting', paymentSpeed: 28, reliability: 95, totalAmount: 22000, size: 120, category: 'high-value' },
  { vendor: 'ABC Services', paymentSpeed: 15, reliability: 88, totalAmount: 21600, size: 100, category: 'high-volume' },
  { vendor: 'Test Corporation', paymentSpeed: 22, reliability: 92, totalAmount: 7500, size: 80, category: 'medium' },
  { vendor: 'City Utilities', paymentSpeed: 8, reliability: 98, totalAmount: 10800, size: 90, category: 'utility' },
  { vendor: 'Tech Solutions', paymentSpeed: 35, reliability: 85, totalAmount: 12800, size: 85, category: 'high-value' },
  { vendor: 'Office Supplies Co', paymentSpeed: 12, reliability: 90, totalAmount: 5400, size: 70, category: 'supplies' },
  { vendor: 'Marketing Agency', paymentSpeed: 45, reliability: 82, totalAmount: 13500, size: 95, category: 'high-value' },
  { vendor: 'Legal Services', paymentSpeed: 42, reliability: 88, totalAmount: 10000, size: 85, category: 'high-value' },
];

const getCategoryColor = (category: string) => {
  const colors = {
    'high-value': 'oklch(0.25 0.08 240)',      // Dark navy
    'high-volume': 'oklch(0.35 0.12 200)',     // Blue
    'medium': 'oklch(0.45 0.15 180)',          // Teal
    'utility': 'oklch(0.55 0.12 160)',         // Green-blue
    'supplies': 'oklch(0.65 0.12 140)'         // Green
  };
  return colors[category as keyof typeof colors] || 'oklch(0.35 0.10 240)';
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-4 border shadow-lg max-w-48">
        <p className="font-medium mb-2" style={{color: 'oklch(0.1 0.1 240)'}}>
          {data.vendor}
        </p>
        <div className="space-y-1 text-xs" style={{color: 'oklch(0.25 0.06 240)'}}>
          <div className="flex justify-between">
            <span>Payment Speed:</span>
            <span className="font-medium">{data.paymentSpeed} days</span>
          </div>
          <div className="flex justify-between">
            <span>Reliability:</span>
            <span className="font-medium">{data.reliability}%</span>
          </div>
          <div className="flex justify-between">
            <span>Total Value:</span>
            <span className="font-medium">${data.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium capitalize">{data.category.replace('-', ' ')}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function VendorPerformanceChart() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Vendor Performance Analysis
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Payment speed vs reliability (bubble size = total value)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.04 240)" opacity={0.3} />
              <XAxis 
                type="number"
                dataKey="paymentSpeed"
                name="Payment Speed"
                domain={[0, 50]}
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                label={{ 
                  value: 'Payment Speed (days)', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: 'oklch(0.35 0.04 240)', fontSize: '12px' }
                }}
              />
              <YAxis 
                type="number"
                dataKey="reliability"
                name="Reliability"
                domain={[80, 100]}
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickFormatter={(value) => `${value}%`}
                label={{ 
                  value: 'Reliability (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'oklch(0.35 0.04 240)', fontSize: '12px' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={vendorPerformanceData}>
                {vendorPerformanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getCategoryColor(entry.category)}
                    fillOpacity={0.8}
                    stroke="oklch(0.25 0.08 240)"
                    strokeWidth={1}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex justify-between text-xs">
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Fastest Payment</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>City Utilities (8 days)</div>
          </div>
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Most Reliable</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>City Utilities (98%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Premium Partner</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>Professional Consulting</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}