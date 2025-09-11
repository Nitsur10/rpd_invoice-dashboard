'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPaymentVelocityData } from '@/lib/real-consolidated-data';
import { useDateFilter } from '@/contexts/date-filter-context';


// Data for the radial gauge
function getGaugeData(dsoData: any) {
  return [
    {
      name: 'DSO',
      value: (dsoData.current / 60) * 100, // Convert to percentage for display
      fill: 'url(#gaugeGradient)'
    }
  ];
}

// Performance categories data
const performanceData = [
  { name: 'Excellent (0-20 days)', value: 25, color: 'oklch(0.65 0.12 140)' },
  { name: 'Good (21-30 days)', value: 45, color: 'oklch(0.55 0.15 160)' },
  { name: 'Fair (31-45 days)', value: 20, color: 'oklch(0.70 0.18 50)' },
  { name: 'Poor (45+ days)', value: 10, color: 'oklch(0.60 0.20 20)' },
];

export function PaymentVelocityGauge() {
  const { dateRange } = useDateFilter();
  const velocityData = getPaymentVelocityData(dateRange.from, dateRange.to);
  const dsoData = {
    current: velocityData.dso,
    target: velocityData.target,
    benchmark: 25,
    trend: velocityData.performance === 'good' ? 'improving' : 'worsening'
  };
  const gaugeData = getGaugeData(dsoData);
  
  const getStatusColor = () => {
    if (dsoData.current <= 20) return 'oklch(0.65 0.12 140)'; // Green
    if (dsoData.current <= 30) return 'oklch(0.55 0.15 160)'; // Blue-green
    if (dsoData.current <= 45) return 'oklch(0.70 0.18 50)'; // Yellow
    return 'oklch(0.60 0.20 20)'; // Red
  };

  const getStatusText = () => {
    if (dsoData.current <= 20) return 'Excellent';
    if (dsoData.current <= 30) return 'Good';
    if (dsoData.current <= 45) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold" style={{color: 'oklch(0.1 0.1 240)'}}>
          Payment Velocity
        </CardTitle>
        <CardDescription style={{color: 'oklch(0.25 0.06 240)'}}>
          Days Sales Outstanding (DSO) performance indicator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="85%" 
              startAngle={180} 
              endAngle={0}
              data={gaugeData}
            >
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={getStatusColor()} stopOpacity={0.8} />
                  <stop offset="100%" stopColor="oklch(0.25 0.08 240)" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <RadialBar 
                dataKey="value" 
                cornerRadius={8}
                fill="url(#gaugeGradient)"
                stroke="oklch(0.95 0.02 240)"
                strokeWidth={2}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold" style={{color: 'oklch(0.1 0.1 240)'}}>
              {dsoData.current}
            </div>
            <div className="text-sm font-medium" style={{color: 'oklch(0.25 0.06 240)'}}>
              days
            </div>
            <Badge 
              variant="outline" 
              className="mt-1 text-xs font-medium"
              style={{
                color: getStatusColor(),
                borderColor: getStatusColor(),
                backgroundColor: `${getStatusColor()}15`
              }}
            >
              {getStatusText()}
            </Badge>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-xs">
          <div>
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Current</div>
            <div style={{color: getStatusColor()}}>{dsoData.current} days</div>
          </div>
          <div>
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Target</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>{dsoData.target} days</div>
          </div>
          <div>
            <div className="font-medium" style={{color: 'oklch(0.25 0.08 240)'}}>Benchmark</div>
            <div style={{color: 'oklch(0.35 0.04 240)'}}>{dsoData.benchmark} days</div>
          </div>
        </div>

        {/* Performance distribution */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-medium mb-2" style={{color: 'oklch(0.25 0.08 240)'}}>
            Industry Performance Distribution
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={8}
                  outerRadius={24}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="oklch(0.95 0.02 240)"
                  strokeWidth={1}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-1">
            <Badge 
              variant="outline"
              className="text-xs"
              style={{
                color: dsoData.trend === 'improving' ? 'oklch(0.65 0.12 140)' : 'oklch(0.60 0.20 20)',
                borderColor: dsoData.trend === 'improving' ? 'oklch(0.65 0.12 140)' : 'oklch(0.60 0.20 20)',
                backgroundColor: dsoData.trend === 'improving' ? 'oklch(0.65 0.12 140 / 0.1)' : 'oklch(0.60 0.20 20 / 0.1)'
              }}
            >
              {dsoData.trend === 'improving' ? '↗' : '↘'} {dsoData.trend}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}