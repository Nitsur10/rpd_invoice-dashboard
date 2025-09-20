#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'invoice_data_since_2024')
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'lib', 'generated')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'invoices-since-may.ts')

const monthMap: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
}

const startDate = new Date(Date.UTC(2025, 4, 1))

function parseDate(value: string | undefined) {
  if (!value) return null
  const match = value.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/)
  if (!match) return null
  const [, dayStr, monthStr, yearStr] = match
  const month = monthMap[monthStr]
  if (month === undefined) return null
  const year = 2000 + Number(yearStr)
  return new Date(Date.UTC(year, month, Number(dayStr)))
}

function parseCurrency(value: string | undefined) {
  if (!value) return 0
  return Number(parseFloat(value.replace(/[^0-9.-]/g, '') || '0').toFixed(2))
}

function deriveStatus(amountDue: number, dueDate: Date | null) {
  if (amountDue <= 0.0001) return 'paid'
  if (dueDate && dueDate.getTime() < Date.now()) return 'overdue'
  return 'pending'
}

function main() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  const lines = raw.trim().split('\n')
  const headers = lines.shift()?.split('\t') ?? []

  const seen = new Set<string>()
  const rows = lines.flatMap((line, index) => {
    const cols = line.split('\t')
    const record: Record<string, string> = {}
    headers.forEach((header, idx) => {
      record[header] = cols[idx] ?? ''
    })

    const invoiceDate = parseDate(record['invoice_date'])
    if (!invoiceDate || invoiceDate < startDate) {
      return []
    }

    const dueDate = parseDate(record['due_date'])
    const total = parseCurrency(record['total'])
    const amountDue = parseCurrency(record['amount_due'] || record['total'])
    const key = `${record['invoice_number']}|${record['supplier_name']}|${total}`

    if (seen.has(key)) {
      return []
    }
    seen.add(key)

    const status = deriveStatus(amountDue, dueDate)

    return [{
      id: `${record['invoice_number'] || 'INV'}-${index}`,
      invoiceNumber: record['invoice_number'] || `INV-${index}`,
      vendorName: record['supplier_name'] || 'Unknown Vendor',
      vendorEmail: record['supplier_email'] || record['email_from_address'] || '',
      amount: total,
      amountDue,
      issueDate: invoiceDate.toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      status,
      description: record['notes'] || record['line_1_desc'] || 'Invoice',
      category: record['customer_name'] || record['source'] || 'General',
      paymentTerms: dueDate && invoiceDate
        ? `Net ${Math.max(0, Math.round((dueDate.getTime() - invoiceDate.getTime()) / 86400000))}`
        : 'Net 30',
      invoiceUrl: record['file_url'] || '',
      receivedDate: invoiceDate.toISOString(),
    }]
  })

  const sorted = rows.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const header = `// Auto-generated from data/invoice_data_since_2024 on ${new Date().toISOString()}`
  const fileContents = `${header}\nexport const invoicesSinceMay2025 = ${JSON.stringify(sorted, null, 2)} as const;\n`
  fs.writeFileSync(OUTPUT_FILE, fileContents)
  console.log(`Wrote ${sorted.length} invoices to ${path.relative(process.cwd(), OUTPUT_FILE)}`)
}

main()
