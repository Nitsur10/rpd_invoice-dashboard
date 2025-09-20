import { config } from 'dotenv'
import path from 'node:path'
import { spawn } from 'node:child_process'
import fs from 'node:fs'

const envPath = path.resolve(process.cwd(), '.env.local')

// Debug: Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('[playwright-dev-server] .env.local file not found at:', envPath)
  process.exit(1)
}

console.log('[playwright-dev-server] Loading environment from:', envPath)
const result = config({ path: envPath })

if (result.error) {
  console.error('[playwright-dev-server] Failed to load .env.local:', result.error)
  process.exit(1)
}

console.log('[playwright-dev-server] Loaded environment variables:', Object.keys(result.parsed || {}).length)

if (result.parsed) {
  for (const [key, value] of Object.entries(result.parsed)) {
    if (typeof process.env[key] === 'undefined') {
      process.env[key] = value
      console.log('[playwright-dev-server] Set env var:', key)
    }
  }
}

// Verify required env vars are set
const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`[playwright-dev-server] Missing required env var: ${varName}`)
    process.exit(1)
  }
}

console.log('[playwright-dev-server] All required environment variables are set')

const nextBin = require.resolve('next/dist/bin/next')

const child = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', '3002'], {
  stdio: 'inherit',
  env: { ...process.env },
})

child.on('error', (error) => {
  console.error('[playwright-dev-server] Failed to start Next.js dev server:', error)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  } else {
    process.exit(code ?? 0)
  }
})

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']

for (const signal of signals) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal)
    }
  })
}
