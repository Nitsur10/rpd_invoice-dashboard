'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for payment methods
const paymentMethodData = [
  { name: 'Bank Transfer', value: 45, count: 27 },
  { name: 'Credit Card', value: 25, count: 15 },
  { name: 'Check', value: 15, count: 9 },
  { name: 'PayPal', value: 10, count: 6 },
  { name: 'Cash', value: 5, count: 3 },
];

// OKLCH color palette for professional look
const COLORS = [
  'oklch(0.25 0.08 240)', // Dark navy blue
  'oklch(0.45 0.12 200)', // Medium blue-cyan
  'oklch(0.35 0.10 180)', // Teal
  'oklch(0.55 0.15 160)', // Light green-blue  
  'oklch(0.65 0.12 140)', // Green
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 border shadow-lg">
        <p className="font-medium" style={{color: 'oklch(0.1 0.1 240)'}}>
          {data.name}
        </p>
        <p className="text-sm" style={{color: 'oklch(0.25 0.06 240)'}}>
          {data.count} invoices ({data.value}%)
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
            {entry.value} ({entry.payload.value}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export function PaymentMethodDistribution() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Payment Method Distribution
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          How clients prefer to pay their invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="oklch(0.95 0.02 240)"
                strokeWidth={2}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Most Popular</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>Bank Transfer (45%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Digital Payments</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>80% of all transactions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}