"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Invoice, PaymentStatus } from "@/lib/types"
import { formatDateForInput } from "@/lib/data"

interface AddInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void
}

export function AddInvoiceModal({ open, onOpenChange, onAddInvoice }: AddInvoiceModalProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorName: '',
    vendorEmail: '',
    amount: '',
    amountDue: '',
    issueDate: '',
    dueDate: '',
    status: 'pending' as PaymentStatus,
    description: '',
    category: '',
    paymentTerms: '',
    invoiceUrl: '',
    receivedDate: formatDateForInput(new Date()),
    paidDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.invoiceNumber || !formData.vendorName || !formData.amount || !formData.issueDate || !formData.dueDate) {
      alert('Please fill in all required fields')
      return
    }

    const amount = parseFloat(formData.amount)
    const amountDue = formData.amountDue ? parseFloat(formData.amountDue) : amount

    const newInvoice: Omit<Invoice, 'id'> = {
      invoiceNumber: formData.invoiceNumber,
      vendorName: formData.vendorName,
      vendorEmail: formData.vendorEmail,
      amount,
      amountDue,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      description: formData.description,
      category: formData.category,
      paymentTerms: formData.paymentTerms,
      invoiceUrl: formData.invoiceUrl || undefined,
      receivedDate: new Date(formData.receivedDate),
      paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
    }

    onAddInvoice(newInvoice)
    
    // Reset form
    setFormData({
      invoiceNumber: '',
      vendorName: '',
      vendorEmail: '',
      amount: '',
      amountDue: '',
      issueDate: '',
      dueDate: '',
      status: 'pending',
      description: '',
      category: '',
      paymentTerms: '',
      invoiceUrl: '',
      receivedDate: formatDateForInput(new Date()),
      paidDate: '',
    })
    
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">Add New Invoice</DialogTitle>
          <DialogDescription>
            Enter the details for the new invoice. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                placeholder="INV-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name *</Label>
              <Input
                id="vendorName"
                value={formData.vendorName}
                onChange={(e) => handleInputChange('vendorName', e.target.value)}
                placeholder="Vendor Company Name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendorEmail">Vendor Email</Label>
              <Input
                id="vendorEmail"
                type="email"
                value={formData.vendorEmail}
                onChange={(e) => handleInputChange('vendorEmail', e.target.value)}
                placeholder="vendor@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Materials">Materials</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amountDue">Amount Due</Label>
              <Input
                id="amountDue"
                type="number"
                step="0.01"
                min="0"
                value={formData.amountDue}
                onChange={(e) => handleInputChange('amountDue', e.target.value)}
                placeholder="Same as amount if empty"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Payment Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as PaymentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange('paymentTerms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the invoice"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoiceUrl">Invoice URL (Optional)</Label>
            <Input
              id="invoiceUrl"
              type="url"
              value={formData.invoiceUrl}
              onChange={(e) => handleInputChange('invoiceUrl', e.target.value)}
              placeholder="https://xero.com/invoices/..."
            />
          </div>
          
          {formData.status === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="paidDate">Paid Date</Label>
              <Input
                id="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={(e) => handleInputChange('paidDate', e.target.value)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}