'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats } from '@/lib/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function TopVendors() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', 'topVendors'],
    queryFn: async () => (await fetchDashboardStats()).data,
    staleTime: 5 * 60 * 1000,
  })

  const vendors = data?.breakdowns.topVendors?.slice(0, 8).map(v => ({
    name: v.vendor,
    amount: Math.round(v.amount || 0),
  })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 300 }}>
        {isLoading ? (
          <div className="h-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : error ? (
          <div className="text-sm text-red-600">Failed to load vendors</div>
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

