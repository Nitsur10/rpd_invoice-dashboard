"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getConsolidatedInvoiceData } from '@/lib/real-consolidated-data';
import { useDateFilter } from '@/contexts/date-filter-context';

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function SupplierAreaChart() {
  const { dateRange } = useDateFilter();
  
  // Generate supplier data
  const chartData = React.useMemo(() => {
    const invoices = dateRange.from || dateRange.to 
      ? getConsolidatedInvoiceData(dateRange.from, dateRange.to)
      : getConsolidatedInvoiceData();
    
    // Group invoices by supplier and calculate totals
    const supplierTotals: Record<string, { count: number; amount: number }> = {};
    
    invoices.forEach(invoice => {
      const supplier = invoice.vendorName;
      if (!supplierTotals[supplier]) {
        supplierTotals[supplier] = { count: 0, amount: 0 };
      }
      supplierTotals[supplier].count += 1;
      supplierTotals[supplier].amount += invoice.amount;
    });
    
    // Get top 8 suppliers by amount and format for chart
    return Object.entries(supplierTotals)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 8)
      .map(([supplier, data]) => ({
        month: supplier.length > 15 ? supplier.substring(0, 15) + '...' : supplier,
        desktop: Math.round(data.amount / 1000), // Convert to thousands for better display
      }));
  }, [dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Suppliers by Invoice Value</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total invoices for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}