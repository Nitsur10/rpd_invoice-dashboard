"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBudgetStatus, formatDuration, PerformanceBudget } from "@/lib/observability";

type EndpointKey = "stats" | "invoices" | "audit" | "outstanding";

interface EndpointResult<T = any> {
  ok: boolean;
  status: number;
  timeMs: number | null;
  data?: T;
  error?: string;
}

function useEndpoint(path: string) {
  return useQuery<EndpointResult>({
    queryKey: ["api-status", path],
    queryFn: async () => {
      const start = performance.now();
      try {
        const res = await fetch(path, { cache: "no-store" });
        const timeMs = Math.round(performance.now() - start);
        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await res.json() : undefined;
        return { ok: res.ok, status: res.status, timeMs, data };
      } catch (e: any) {
        return { ok: false, status: 0, timeMs: null, error: String(e?.message || e) };
      }
    },
    refetchOnWindowFocus: false,
  });
}

export default function ApiStatusPage() {
  const endpoints: Record<EndpointKey, string> = {
    stats: "/api/stats",
    invoices: "/api/invoices",
    audit: "/api/audit",
    outstanding: "/api/outstanding",
  };

  const statsQ = useEndpoint(endpoints.stats);
  const invoicesQ = useEndpoint(endpoints.invoices);
  const auditQ = useEndpoint(endpoints.audit);
  const outstandingQ = useEndpoint(endpoints.outstanding);

  const items: Array<{ key: EndpointKey; label: string; q: ReturnType<typeof useEndpoint> }> = [
    { key: "stats", label: "Dashboard Stats", q: statsQ },
    { key: "invoices", label: "Invoices", q: invoicesQ },
    { key: "audit", label: "Audit", q: auditQ },
    { key: "outstanding", label: "Outstanding", q: outstandingQ },
  ];

  // Get performance budget status
  const budgetStatus = getBudgetStatus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "oklch(0.25 0.08 240)" }}>
          API Status
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Live health for backend endpoints on this environment.
        </p>
      </div>

      {/* Performance Budget Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Performance Budget Status
            <Badge variant={budgetStatus.some(b => b.status === 'Over Budget') ? 'destructive' : 'default'}>
              {budgetStatus.filter(b => b.status === 'Over Budget').length} Over Budget
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {budgetStatus.map((budget) => (
              <div key={budget.endpoint} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{budget.endpoint}</span>
                  <Badge variant={budget.status === 'Over Budget' ? 'destructive' : 'default'} className="text-xs">
                    {budget.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Budget:</span>
                    <span className="font-mono">{budget.budgetMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Breaches:</span>
                    <span className="font-mono">{budget.breachCount}</span>
                  </div>
                  {budget.lastBreach && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last:</span>
                      <span className="font-mono text-xs">
                        {new Date(budget.lastBreach).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map(({ key, label, q }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{label}</span>
                {q.isLoading ? (
                  <Badge variant="secondary">checking…</Badge>
                ) : q.data?.ok ? (
                  <Badge className="bg-green-600 text-white">200 OK</Badge>
                ) : (
                  <Badge className="bg-red-600 text-white">{q.data?.status || 0}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Endpoint</span>
                <span className="font-mono">{endpoints[key]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Response Time</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{q.data?.timeMs ?? "–"} ms</span>
                  {q.data?.timeMs && (() => {
                    const budget = budgetStatus.find(b => b.endpoint === endpoints[key]);
                    if (budget) {
                      const { status } = formatDuration(q.data.timeMs, budget.budgetMs);
                      return (
                        <Badge 
                          variant={status === 'error' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'} 
                          className="text-xs"
                        >
                          {status === 'good' ? '✓' : status === 'warning' ? '⚠' : '✗'}
                        </Badge>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <Separator />
              <div className="text-slate-600 dark:text-slate-400">Preview</div>
              <pre className="max-h-40 overflow-auto rounded bg-slate-50 dark:bg-slate-900 p-2 text-xs">
                {q.data?.data ? JSON.stringify(q.data.data, null, 2) : q.data?.error || ""}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

