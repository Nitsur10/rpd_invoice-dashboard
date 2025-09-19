import { describe, it, expect } from '@jest/globals'

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

describe('Invoice API', () => {
  describe('GET /api/invoices', () => {
    it('returns data and pagination metadata', async () => {
      const response = await fetch(`${baseUrl}/api/invoices`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('data')
      expect(payload).toHaveProperty('pagination')
      expect(Array.isArray(payload.data)).toBe(true)
      expect(payload.pagination).toEqual(
        expect.objectContaining({ total: expect.any(Number), pageCount: expect.any(Number) })
      )
    })

    it('accepts filter parameters without erroring', async () => {
      const url = `${baseUrl}/api/invoices?status=pending&category=Utilities&vendor=TasWater&amountMin=100&amountMax=500`
      const response = await fetch(url)
      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/invoices/saved-views', () => {
    it('responds with a views array', async () => {
      const response = await fetch(`${baseUrl}/api/invoices/saved-views`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(Array.isArray(payload.views)).toBe(true)
    })
  })

  describe('POST /api/invoices/export', () => {
    it('returns a clear error when Supabase is unavailable', async () => {
      const response = await fetch(`${baseUrl}/api/invoices/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: {} }),
      })

      if (response.status === 201) {
        const payload = await response.json()
        expect(payload).toHaveProperty('id')
        expect(payload).toHaveProperty('status')
      } else {
        expect(response.status).toBe(503)
        const payload = await response.json()
        expect(payload).toHaveProperty('code', 'SUPABASE_DISABLED')
      }
    })
  })
})
