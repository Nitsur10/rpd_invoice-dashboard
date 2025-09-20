import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const tableEnv = process.env.SUPABASE_INVOICES_TABLE || 'invoices'

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function inspectTable(table: string) {
  const { data, error } = await admin
    .from(table)
    .select('created_at, total, amount_due, due_date, category, supplier_name', { count: 'exact', head: false })
    .limit(5000)

  if (error) {
    return { table, ok: false, error: error.message }
  }

  const count = data?.length || 0
  let minDate: string | null = null
  let maxDate: string | null = null
  let sumTotal = 0

  for (const row of data || []) {
    const created = row.created_at ? new Date(row.created_at).toISOString() : null
    if (created) {
      if (!minDate || created < minDate) minDate = created
      if (!maxDate || created > maxDate) maxDate = created
    }
    const amount = Number(row.total ?? 0)
    if (!Number.isNaN(amount)) sumTotal += amount
  }

  return { table, ok: true, count, minDate, maxDate, sumTotal }
}

async function main() {
  console.log('🔍 Diagnosing invoice tables...')
  const primary = await inspectTable(tableEnv)
  const fallback = await inspectTable(tableEnv === 'invoices' ? 'Invoice' : 'invoices')

  console.log('\nPrimary table:', primary.table)
  console.log(primary)

  console.log('\nFallback table:', fallback.table)
  console.log(fallback)

  if (primary.ok && primary.count && primary.minDate) {
    console.log(`\n✅ Found ${primary.count} rows in ${primary.table}. Date range: ${primary.minDate} → ${primary.maxDate}. Total: ${primary.sumTotal.toLocaleString()}`)
  } else if (fallback.ok && fallback.count && fallback.minDate) {
    console.log(`\n✅ Found ${fallback.count} rows in ${fallback.table}. Date range: ${fallback.minDate} → ${fallback.maxDate}. Total: ${fallback.sumTotal.toLocaleString()}`)
  } else {
    console.log('\n❌ No rows found in either table or errors encountered. Check table name and data.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


