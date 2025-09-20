/*
  Invoice Dashboard Performance Validation Script
  - Headless browser automation with Playwright
  - Lighthouse performance score
  - API latency benchmarks
  - Table render benchmarks via API interception (200/1000/10000 rows)
  - Bundle size aggregation from network responses
  - axe-core accessibility audit (WCAG 2.1 AA)
  - Generates VALIDATION_REPORT.md and exits with code 0 if all targets met, else 1

  Usage:
    BASE_URL=https://your-deployment.example.com npx tsx scripts/validate-performance.ts

  Required devDependencies (not installed automatically):
    npm i -D playwright lighthouse chrome-launcher axe-core
*/

import fs from 'node:fs'
import path from 'node:path'

type LH = typeof import('lighthouse')
type ChromeLauncher = typeof import('chrome-launcher')

// Targets
const TARGETS = {
  lighthouseScore: 90,
  initialLoadMs: 1000,
  apiAvgMs: 200,
  render200Ms: 100,
  render1000Ms: 200, // not specified, interpolate reasonable value
  render10000Ms: 300,
  bundleBytes: 1_000_000, // 1MB
}

const BASE_URL = (process.env.BASE_URL || process.argv[2] || '').replace(/\/$/, '')
if (!BASE_URL) {
  console.error('BASE_URL is required. Provide via env or arg.\nExample: BASE_URL=https://app.example.com tsx scripts/validate-performance.ts')
  process.exit(2)
}

function now() { return Date.now() }

async function dynamicImport<T>(specifier: string): Promise<T> {
  // Defer heavy deps until needed
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await import(specifier)
}

async function runLighthouse(url: string) {
  const lighthouse: LH = await dynamicImport('lighthouse')
  const chromeLauncher: ChromeLauncher = await dynamicImport('chrome-launcher')

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] })
  try {
    const result = await lighthouse.default(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
      screenEmulation: { disabled: true },
      throttling: { rttMs: 0, throughputKbps: 0, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
      disableStorageReset: true,
    })
    const lhr = result.lhr
    const perfScore = Math.round((lhr.categories.performance?.score || 0) * 100)
    return { perfScore, timing: lhr.timing?.total || null }
  } finally {
    await chrome.kill()
  }
}

async function runPlaywrightBenchmarks() {
  const { chromium, request } = await dynamicImport<typeof import('playwright')>('playwright')
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({ bypassCSP: true, javaScriptEnabled: true })

  // No-store headers for deterministic API timing
  await context.setExtraHTTPHeaders({ 'Cache-Control': 'no-store' })

  const page = await context.newPage()

  // Capture JS bundle sizes during initial load
  let bundleBytes = 0
  const seen = new Set<string>()
  page.on('response', async (res) => {
    try {
      const url = res.url()
      const ct = res.headers()['content-type'] || ''
      const isJs = url.endsWith('.js') || ct.includes('application/javascript') || ct.includes('text/javascript')
      if (!isJs) return
      if (seen.has(url)) return
      seen.add(url)
      const lenHeader = res.headers()['content-length']
      if (lenHeader) {
        bundleBytes += parseInt(lenHeader, 10)
      } else {
        const body = await res.body()
        bundleBytes += body.byteLength
      }
    } catch {}
  })

  // Initial load timing via Performance APIs
  let initialLoadMs: number | null = null
  await page.goto(BASE_URL + '/', { waitUntil: 'load' })
  initialLoadMs = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav) return Math.round(nav.loadEventEnd - nav.startTime)
    // fallback
    const t = performance.timing
    return t.loadEventEnd - t.navigationStart
  })

  // API response times (average of 5)
  const rc = await request.newContext({ extraHTTPHeaders: { 'Cache-Control': 'no-store' } })
  async function avg(url: string, runs = 5) {
    const times: number[] = []
    for (let i = 0; i < runs; i++) {
      const start = now()
      const res = await rc.get(url, { timeout: 20_000 })
      await res.body()
      times.push(now() - start)
    }
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  }
  const apiTimes = {
    invoices: await avg(`${BASE_URL}/api/invoices?page=1&limit=20`),
    stats: await avg(`${BASE_URL}/api/stats`),
    outstanding: await avg(`${BASE_URL}/api/outstanding`),
  }

  // Table render benchmarks by intercepting /api/invoices to return N rows
  async function renderBench(n: number): Promise<number> {
    // Generate synthetic rows matching UI mapping
    const rows = Array.from({ length: n }).map((_, i) => ({
      id: `inv_${i + 1}`,
      invoiceNumber: `INV-${String(i + 1).padStart(6, '0')}`,
      vendorName: `Vendor ${((i % 50) + 1)}`,
      vendorEmail: `vendor${(i % 50) + 1}@example.com`,
      amount: Math.round(100 + (i % 1000)),
      amountDue: Math.round(100 + (i % 1000)),
      issueDate: new Date(2025, 4, 1 + (i % 28)).toISOString(),
      dueDate: new Date(2025, 5, 1 + (i % 28)).toISOString(),
      status: i % 9 === 0 ? 'overdue' : i % 3 === 0 ? 'paid' : 'pending',
      description: 'Synthetic row',
      category: 'General',
      paymentTerms: 'Net 30',
      invoiceUrl: '',
      receivedDate: new Date(2025, 4, 1 + (i % 28)).toISOString(),
      paidDate: null as string | null,
    }))

    let fulfilled = false
    await page.route('**/api/invoices**', async (route) => {
      if (fulfilled) return route.continue()
      fulfilled = true
      await page.evaluate(() => performance.mark('invoices_data_received'))
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: rows,
          pagination: { total: rows.length, pageCount: 1, pageSize: rows.length, pageIndex: 0 },
        }),
      })
    })

    // Navigate fresh to invoices and wait for table container
    await page.goto(BASE_URL + '/invoices', { waitUntil: 'domcontentloaded' })

    // Wait for first visible row to paint, then measure two RAFs to stabilize
    const selector = 'div[role="row"], table tbody tr, div[data-state]' // best-effort across implementations
    await page.waitForTimeout(50)
    await page.waitForSelector(selector, { timeout: 20_000 })
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      performance.mark('table_rendered')
    })
    const duration = await page.evaluate(() => {
      const m = performance.measure('table_render', 'invoices_data_received', 'table_rendered')
      return Math.round(m.duration)
    })

    // Cleanup routes to avoid leaking to next run
    await page.unroute('**/api/invoices**')
    return duration
  }

  const render200 = await renderBench(200)
  const render1000 = await renderBench(1000)
  const render10000 = await renderBench(10000)

  // Accessibility audit with axe-core on home and invoices
  const axe = await dynamicImport<typeof import('axe-core')>('axe-core')
  async function runAxe(url: string) {
    await page.goto(url, { waitUntil: 'load' })
    await page.addScriptTag({ content: axe.source })
    const results = await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await (window as any).axe.run(document, { runOnly: ['wcag2a', 'wcag21aa'] })
    })
    return results.violations as Array<{ id: string; help: string; impact: string; nodes: any[] }>
  }
  const violationsHome = await runAxe(BASE_URL + '/')
  const violationsInvoices = await runAxe(BASE_URL + '/invoices')
  const a11yViolations = [...violationsHome, ...violationsInvoices]

  await browser.close()

  return {
    initialLoadMs: initialLoadMs || null,
    bundleBytes,
    apiTimes,
    render: { r200: render200, r1000: render1000, r10000: render10000 },
    a11yViolations,
  }
}

async function main() {
  // 1) Lighthouse
  const lh = await runLighthouse(BASE_URL + '/')

  // 2–4) Playwright suite
  const pw = await runPlaywrightBenchmarks()

  // Compare to targets
  const failures: Array<{ area: string; url?: string; metric: string; value: string; target: string }> = []

  if (lh.perfScore < TARGETS.lighthouseScore) failures.push({ area: 'Lighthouse', url: BASE_URL + '/', metric: 'Performance Score', value: String(lh.perfScore), target: `>= ${TARGETS.lighthouseScore}` })
  if (pw.initialLoadMs !== null && pw.initialLoadMs > TARGETS.initialLoadMs) failures.push({ area: 'Page Load', url: BASE_URL + '/', metric: 'Initial Load (ms)', value: String(pw.initialLoadMs), target: `< ${TARGETS.initialLoadMs}` })

  if (pw.apiTimes.invoices > TARGETS.apiAvgMs) failures.push({ area: 'API', url: '/api/invoices?page=1&limit=20', metric: 'Avg Latency (ms)', value: String(pw.apiTimes.invoices), target: `< ${TARGETS.apiAvgMs}` })
  if (pw.apiTimes.stats > TARGETS.apiAvgMs) failures.push({ area: 'API', url: '/api/stats', metric: 'Avg Latency (ms)', value: String(pw.apiTimes.stats), target: `< ${TARGETS.apiAvgMs}` })
  if (pw.apiTimes.outstanding > TARGETS.apiAvgMs) failures.push({ area: 'API', url: '/api/outstanding', metric: 'Avg Latency (ms)', value: String(pw.apiTimes.outstanding), target: `< ${TARGETS.apiAvgMs}` })

  if (pw.render.r200 > TARGETS.render200Ms) failures.push({ area: 'Render', url: '/invoices', metric: 'Render 200 rows (ms)', value: String(pw.render.r200), target: `< ${TARGETS.render200Ms}` })
  if (pw.render.r1000 > TARGETS.render1000Ms) failures.push({ area: 'Render', url: '/invoices', metric: 'Render 1000 rows (ms)', value: String(pw.render.r1000), target: `< ${TARGETS.render1000Ms}` })
  if (pw.render.r10000 > TARGETS.render10000Ms) failures.push({ area: 'Render', url: '/invoices', metric: 'Render 10000 rows (ms)', value: String(pw.render.r10000), target: `< ${TARGETS.render10000Ms}` })

  if (pw.bundleBytes > TARGETS.bundleBytes) failures.push({ area: 'Bundle', url: BASE_URL + '/', metric: 'JS Size (bytes)', value: String(pw.bundleBytes), target: `< ${TARGETS.bundleBytes}` })

  if (pw.a11yViolations.length > 0) failures.push({ area: 'Accessibility', url: 'axe-core', metric: 'WCAG 2.1 AA Violations', value: String(pw.a11yViolations.length), target: '0' })

  const report = `# Invoice Dashboard Performance Validation\n\n` +
  `Base URL: ${BASE_URL}\n\n` +
  `## Summary\n\n` +
  `| Area        | Metric                    | Measured | Target | Status |\n` +
  `|-------------|---------------------------|----------|--------|--------|\n` +
  `| Lighthouse  | Performance Score         | ${lh.perfScore} | \\u2265 ${TARGETS.lighthouseScore} | ${lh.perfScore >= TARGETS.lighthouseScore ? 'PASS' : 'FAIL'} |\n` +
  `| Page Load   | Initial Load (ms)         | ${pw.initialLoadMs ?? 'n/a'} | < ${TARGETS.initialLoadMs} | ${(pw.initialLoadMs ?? 0) < TARGETS.initialLoadMs ? 'PASS' : 'FAIL'} |\n` +
  `| API         | /api/invoices avg (ms)    | ${pw.apiTimes.invoices} | < ${TARGETS.apiAvgMs} | ${pw.apiTimes.invoices < TARGETS.apiAvgMs ? 'PASS' : 'FAIL'} |\n` +
  `| API         | /api/stats avg (ms)       | ${pw.apiTimes.stats} | < ${TARGETS.apiAvgMs} | ${pw.apiTimes.stats < TARGETS.apiAvgMs ? 'PASS' : 'FAIL'} |\n` +
  `| API         | /api/outstanding avg (ms) | ${pw.apiTimes.outstanding} | < ${TARGETS.apiAvgMs} | ${pw.apiTimes.outstanding < TARGETS.apiAvgMs ? 'PASS' : 'FAIL'} |\n` +
  `| Render      | 200 rows (ms)             | ${pw.render.r200} | < ${TARGETS.render200Ms} | ${pw.render.r200 < TARGETS.render200Ms ? 'PASS' : 'FAIL'} |\n` +
  `| Render      | 1000 rows (ms)            | ${pw.render.r1000} | < ${TARGETS.render1000Ms} | ${pw.render.r1000 < TARGETS.render1000Ms ? 'PASS' : 'FAIL'} |\n` +
  `| Render      | 10000 rows (ms)           | ${pw.render.r10000} | < ${TARGETS.render10000Ms} | ${pw.render.r10000 < TARGETS.render10000Ms ? 'PASS' : 'FAIL'} |\n` +
  `| Bundle      | JS total (bytes)          | ${pw.bundleBytes} | < ${TARGETS.bundleBytes} | ${pw.bundleBytes < TARGETS.bundleBytes ? 'PASS' : 'FAIL'} |\n` +
  `| A11y        | WCAG 2.1 AA Violations    | ${pw.a11yViolations.length} | 0 | ${pw.a11yViolations.length === 0 ? 'PASS' : 'FAIL'} |\n\n` +
  `## Failures\n\n` +
  (failures.length === 0 ? '- None\n' : failures.map(f => `- [${f.area}] ${f.metric} at ${f.url || '-'}: measured ${f.value}, target ${f.target}`).join('\n')) +
  `\n\n## Recommendations\n\n` +
  `- If Lighthouse < target: ensure static assets are cached, reduce main-thread work, confirm dynamic import boundaries for charts/tables.\n` +
  `- If API latency > target: validate DB indexes are in use, check PostgREST explain plans, increase edge cache or add server-side in-memory caches.\n` +
  `- If render time > target: reduce props churn, memoize row cells, verify virtualization overscan, and avoid expensive cell formatters.\n` +
  `- If bundle > target: double-check devtools excluded in prod, tree-shake icons/libs, split chart libs.\n` +
  `- If a11y violations: address axe rule IDs in results, add missing labels/roles/contrast.\n`

  const outPath = path.join(process.cwd(), 'VALIDATION_REPORT.md')
  fs.writeFileSync(outPath, report, 'utf8')
  console.log(`\nValidation report written to ${outPath}`)

  // Exit code
  process.exit(failures.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('Validation failed with error:', err)
  process.exit(1)
})

