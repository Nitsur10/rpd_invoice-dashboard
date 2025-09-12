"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function CategoryBreakdown({
  data,
  isLoading,
}: {
  data: Array<{ category: string; count: number; amount: number }>
  isLoading?: boolean
}) {
  const categories = (data || []).map(c => ({
    name: c.category,
    amount: Math.round(c.amount || 0),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 300 }}>
        {isLoading ? (
          <div className="h-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" fill="oklch(0.25 0.08 240)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
