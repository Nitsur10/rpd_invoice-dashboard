'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for vendor relationships (volume vs average amount)
const vendorData = [
  { vendor: 'Professional Consulting', volume: 8, avgAmount: 2750, totalAmount: 22000, size: 120 },
  { vendor: 'ABC Services', volume: 12, avgAmount: 1800, totalAmount: 21600, size: 100 },
  { vendor: 'Test Corporation', volume: 6, avgAmount: 1250, totalAmount: 7500, size: 80 },
  { vendor: 'City Utilities', volume: 24, avgAmount: 450, totalAmount: 10800, size: 90 },
  { vendor: 'Tech Solutions', volume: 4, avgAmount: 3200, totalAmount: 12800, size: 85 },
  { vendor: 'Office Supplies Co', volume: 18, avgAmount: 300, totalAmount: 5400, size: 70 },
  { vendor: 'Marketing Agency', volume: 3, avgAmount: 4500, totalAmount: 13500, size: 95 },
  { vendor: 'Legal Services', volume: 2, avgAmount: 5000, totalAmount: 10000, size: 85 },
];

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
            <span>Volume:</span>
            <span className="font-medium">{data.volume} invoices</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Amount:</span>
            <span className="font-medium">${data.avgAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">${data.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function VendorRelationshipMap() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Vendor Relationship Map
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Invoice volume vs average amount (bubble size = total value)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.04 240)" opacity={0.3} />
              <XAxis 
                type="number"
                dataKey="volume"
                name="Invoice Volume"
                domain={[0, 'dataMax + 2']}
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                label={{ 
                  value: 'Invoice Volume', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: 'oklch(0.35 0.04 240)', fontSize: '12px' }
                }}
              />
              <YAxis 
                type="number"
                dataKey="avgAmount"
                name="Average Amount"
                domain={[0, 'dataMax + 500']}
                tick={{ fill: 'oklch(0.35 0.04 240)', fontSize: 12 }}
                axisLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickLine={{ stroke: 'oklch(0.75 0.06 240)' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                label={{ 
                  value: 'Average Amount ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'oklch(0.35 0.04 240)', fontSize: '12px' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={vendorData}>
                {vendorData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`oklch(${0.3 + (index * 0.08)} 0.12 ${200 + (index * 15)})`}
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
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>High Volume</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>City Utilities (24)</div>
          </div>
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>High Value</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>Legal Services ($5k avg)</div>
          </div>
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Top Revenue</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>Professional Consulting</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}