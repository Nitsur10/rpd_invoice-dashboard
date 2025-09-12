"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function TopVendors({
  data,
  isLoading,
}: {
  data: Array<{ vendor: string; count: number; amount: number }>
  isLoading?: boolean
}) {
  const vendors = (data || []).slice(0, 8).map(v => ({
    name: v.vendor,
    amount: Math.round(v.amount || 0),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 300 }}>
        {isLoading ? (
          <div className="h-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendors}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" fill="oklch(0.65 0.12 80)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
