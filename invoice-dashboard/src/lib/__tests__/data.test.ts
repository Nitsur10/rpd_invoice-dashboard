import { 
  formatCurrency, 
  formatDateForDisplay, 
  getStatusBadgeVariant,
  calculateTotalRevenue,
  calculateOverdueInvoices,
  getInvoiceData
} from '../data'

describe('Data Utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(10)).toBe('$10.00')
    })

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })
  })

  describe('formatDateForDisplay', () => {
    it('should format dates correctly for display', () => {
      const date = new Date('2025-05-15')
      const result = formatDateForDisplay(date.toISOString())
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/) // MM/dd/yyyy format
    })

    it('should handle invalid dates gracefully', () => {
      expect(formatDateForDisplay('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('getStatusBadgeVariant', () => {
    it('should return correct variants for different statuses', () => {
      expect(getStatusBadgeVariant('paid')).toBe('default')
      expect(getStatusBadgeVariant('pending')).toBe('secondary')
      expect(getStatusBadgeVariant('overdue')).toBe('destructive')
    })

    it('should handle unknown statuses', () => {
      expect(getStatusBadgeVariant('unknown' as any)).toBe('secondary')
    })
  })

  describe('Business Logic Calculations', () => {
    const mockInvoices = [
      {
        id: '1',
        invoiceNumber: 'INV-001',
        vendorName: 'Test Vendor',
        vendorEmail: 'test@vendor.com',
        amount: 1000,
        amountDue: 1000,
        issueDate: new Date('2025-05-01'),
        dueDate: new Date('2025-06-01'),
        status: 'pending' as const,
        description: 'Test invoice',
        category: 'Services',
        paymentTerms: 'Net 30',
        receivedDate: new Date('2025-05-01')
      },
      {
        id: '2',
        invoiceNumber: 'INV-002',
        vendorName: 'Test Vendor 2',
        vendorEmail: 'test2@vendor.com',
        amount: 2000,
        amountDue: 0,
        issueDate: new Date('2025-05-02'),
        dueDate: new Date('2025-06-02'),
        status: 'paid' as const,
        description: 'Test invoice 2',
        category: 'Materials',
        paymentTerms: 'Net 30',
        receivedDate: new Date('2025-05-02'),
        paidDate: new Date('2025-05-15')
      }
    ]

    describe('calculateTotalRevenue', () => {
      it('should calculate total revenue correctly', () => {
        const result = calculateTotalRevenue(mockInvoices)
        expect(result).toBe(3000) // 1000 + 2000
      })

      it('should handle empty array', () => {
        expect(calculateTotalRevenue([])).toBe(0)
      })
    })

    describe('calculateOverdueInvoices', () => {
      it('should identify overdue invoices correctly', () => {
        const overdueInvoices = [
          {
            ...mockInvoices[0],
            dueDate: new Date('2024-01-01'), // Past due date
            status: 'overdue' as const
          }
        ]
        
        const result = calculateOverdueInvoices(overdueInvoices)
        expect(result).toBe(1)
      })

      it('should not count paid invoices as overdue', () => {
        const result = calculateOverdueInvoices(mockInvoices)
        expect(result).toBe(0) // No overdue invoices in mock data
      })
    })
  })

  describe('getInvoiceData', () => {
    it('should return filtered invoice data from May 2025 onwards', () => {
      const invoices = getInvoiceData()
      
      // Should have invoices
      expect(invoices.length).toBeGreaterThan(0)
      
      // All invoices should be from May 1st, 2025 onwards
      invoices.forEach(invoice => {
        const issueDate = new Date(invoice.issueDate)
        const mayFirst2025 = new Date('2025-05-01')
        expect(issueDate >= mayFirst2025).toBe(true)
      })
    })

    it('should return valid invoice objects with required fields', () => {
      const invoices = getInvoiceData()
      const firstInvoice = invoices[0]
      
      expect(firstInvoice).toHaveProperty('id')
      expect(firstInvoice).toHaveProperty('invoiceNumber')
      expect(firstInvoice).toHaveProperty('vendorName')
      expect(firstInvoice).toHaveProperty('amount')
      expect(firstInvoice).toHaveProperty('status')
      expect(['paid', 'pending', 'overdue']).toContain(firstInvoice.status)
    })

    it('should calculate correct total amount across all invoices', () => {
      const invoices = getInvoiceData()
      const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
      
      // Based on agent testing report, total should be $59,285.26
      expect(totalAmount).toBeCloseTo(59285.26, 2)
    })
  })
})