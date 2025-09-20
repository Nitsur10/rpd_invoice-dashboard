import { NextRequest } from 'next/server'

async function smoke(path: string, handler: (req: NextRequest) => Promise<Response>) {
  const url = `http://localhost${path}`
  const req = new NextRequest(url)
  const res = await handler(req)
  const ct = res.headers.get('content-type') || ''
  const body = ct.includes('application/json') ? await res.json() : await res.text()
  console.log(`[SMOKE] ${path} => ${res.status}`, JSON.stringify(body).slice(0, 400))
}

async function run() {
  const stats = await import('../src/app/api/stats/route')
  const invoices = await import('../src/app/api/invoices/route')
  const outstanding = await import('../src/app/api/outstanding/route')

  await smoke('/api/stats', stats.GET)
  await smoke('/api/invoices', invoices.GET)
  await smoke('/api/outstanding', outstanding.GET)
}

run().catch((e) => {
  console.error('Smoke test failed:', e)
  process.exit(1)
})

