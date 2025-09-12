import { DashboardStats, Invoice, InvoiceStatus, PaymentStatus } from './types';

/**
 * Sample dashboard statistics for testing
 */
export const mockDashboardStats: DashboardStats = {
  totalInvoices: 247,
  totalAmount: 127456.50,
  pendingPayments: 23,
  overduePayments: 12,
  paidAmount: 89234.75,
  averageAmount: 516.26,
  monthlyGrowth: 23.5,
  paymentRate: 87.4,
  averageProcessingTime: 2.3,
  activeVendors: 47,
  successRate: 98.7
};

/**
 * Sample invoice data for testing components
 */
export const mockInvoiceData: Invoice[] = [
  {
    id: 'INV-2024-001',
    invoiceNumber: 'RPD-001-2024',
    vendorName: 'Kingsley Construction Co.',
    amount: 15420.50,
    dueDate: '2024-12-15',
    issueDate: '2024-11-15',
    status: 'pending' as InvoiceStatus,
    paymentStatus: 'pending' as PaymentStatus,
    description: 'Foundation work - Residential Block A',
    category: 'Construction',
    priority: 'high',
    tags: ['construction', 'foundation', 'block-a']
  },
  {
    id: 'INV-2024-002', 
    invoiceNumber: 'RPD-002-2024',
    vendorName: 'Elite Electrical Services',
    amount: 8750.00,
    dueDate: '2024-12-20',
    issueDate: '2024-11-20',
    status: 'approved' as InvoiceStatus,
    paymentStatus: 'paid' as PaymentStatus,
    description: 'Electrical installation - Phase 2',
    category: 'Electrical',
    priority: 'medium',
    tags: ['electrical', 'installation', 'phase2']
  },
  {
    id: 'INV-2024-003',
    invoiceNumber: 'RPD-003-2024', 
    vendorName: 'Premier Plumbing Solutions',
    amount: 12300.75,
    dueDate: '2024-12-10',
    issueDate: '2024-11-10',
    status: 'processed' as InvoiceStatus,
    paymentStatus: 'overdue' as PaymentStatus,
    description: 'Plumbing systems - Units 1-12',
    category: 'Plumbing',
    priority: 'high',
    tags: ['plumbing', 'systems', 'units']
  },
  {
    id: 'INV-2024-004',
    invoiceNumber: 'RPD-004-2024',
    vendorName: 'Horizon HVAC Systems', 
    amount: 22150.25,
    dueDate: '2024-12-25',
    issueDate: '2024-11-25',
    status: 'draft' as InvoiceStatus,
    paymentStatus: 'pending' as PaymentStatus,
    description: 'HVAC installation - Commercial Wing',
    category: 'HVAC',
    priority: 'medium',
    tags: ['hvac', 'installation', 'commercial']
  },
  {
    id: 'INV-2024-005',
    invoiceNumber: 'RPD-005-2024',
    vendorName: 'Australia Paint & Coatings',
    amount: 6890.00,
    dueDate: '2025-01-05',
    issueDate: '2024-12-05',
    status: 'pending' as InvoiceStatus,
    paymentStatus: 'pending' as PaymentStatus,
    description: 'Interior painting - Residential units',
    category: 'Painting',
    priority: 'low',
    tags: ['painting', 'interior', 'residential']
  },
  {
    id: 'INV-2024-006',
    invoiceNumber: 'RPD-006-2024',
    vendorName: 'Sydney Roofing Specialists',
    amount: 18500.50,
    dueDate: '2024-12-30',
    issueDate: '2024-11-30',
    status: 'approved' as InvoiceStatus,
    paymentStatus: 'paid' as PaymentStatus,
    description: 'Roof installation - Building C',
    category: 'Roofing',
    priority: 'high',
    tags: ['roofing', 'installation', 'building-c']
  },
  {
    id: 'INV-2024-007',
    invoiceNumber: 'RPD-007-2024',
    vendorName: 'Metro Glass & Glazing',
    amount: 9420.75,
    dueDate: '2025-01-10',
    issueDate: '2024-12-10',
    status: 'processed' as InvoiceStatus,
    paymentStatus: 'pending' as PaymentStatus,
    description: 'Window installation - All floors',
    category: 'Glazing',
    priority: 'medium',
    tags: ['glazing', 'windows', 'floors']
  },
  {
    id: 'INV-2024-008',
    invoiceNumber: 'RPD-008-2024',
    vendorName: 'Prestige Flooring Solutions',
    amount: 14750.25,
    dueDate: '2024-12-12',
    issueDate: '2024-11-12',
    status: 'pending' as InvoiceStatus,
    paymentStatus: 'overdue' as PaymentStatus,
    description: 'Hardwood flooring - Premium units',
    category: 'Flooring',
    priority: 'high',
    tags: ['flooring', 'hardwood', 'premium']
  }
];

/**
 * Sample activity data for dashboard
 */
export const mockRecentActivity = [
  {
    id: '1',
    type: 'payment',
    description: 'Payment received from Elite Electrical Services',
    amount: 8750.00,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'completed'
  },
  {
    id: '2', 
    type: 'invoice',
    description: 'New invoice created for Horizon HVAC Systems',
    amount: 22150.25,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: 'pending'
  },
  {
    id: '3',
    type: 'overdue',
    description: 'Invoice overdue: Premier Plumbing Solutions',
    amount: 12300.75,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    status: 'warning'
  },
  {
    id: '4',
    type: 'approval',
    description: 'Invoice approved: Sydney Roofing Specialists',
    amount: 18500.50,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    status: 'approved'
  },
  {
    id: '5',
    type: 'processing',
    description: 'Processing invoice: Metro Glass & Glazing',
    amount: 9420.75,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: 'processing'
  }
];

/**
 * Sample Kanban data for board view
 */
export const mockKanbanData = {
  columns: {
    'draft': {
      id: 'draft',
      title: 'Draft',
      color: 'slate',
      invoiceIds: ['INV-2024-004']
    },
    'pending': {
      id: 'pending', 
      title: 'Pending Review',
      color: 'blue',
      invoiceIds: ['INV-2024-001', 'INV-2024-005', 'INV-2024-008']
    },
    'approved': {
      id: 'approved',
      title: 'Approved',
      color: 'green', 
      invoiceIds: ['INV-2024-002', 'INV-2024-006']
    },
    'processed': {
      id: 'processed',
      title: 'Processed',
      color: 'purple',
      invoiceIds: ['INV-2024-003', 'INV-2024-007']
    }
  },
  columnOrder: ['draft', 'pending', 'approved', 'processed']
};

/**
 * Sample vendor data
 */
export const mockVendorData = [
  { name: 'Kingsley Construction Co.', category: 'Construction', invoices: 15, totalAmount: 185420.50 },
  { name: 'Elite Electrical Services', category: 'Electrical', invoices: 8, totalAmount: 67500.00 },
  { name: 'Premier Plumbing Solutions', category: 'Plumbing', invoices: 12, totalAmount: 123750.75 },
  { name: 'Horizon HVAC Systems', category: 'HVAC', invoices: 6, totalAmount: 145890.25 },
  { name: 'Australia Paint & Coatings', category: 'Painting', invoices: 18, totalAmount: 89240.00 },
  { name: 'Sydney Roofing Specialists', category: 'Roofing', invoices: 4, totalAmount: 75500.50 },
  { name: 'Metro Glass & Glazing', category: 'Glazing', invoices: 9, totalAmount: 98420.75 },
  { name: 'Prestige Flooring Solutions', category: 'Flooring', invoices: 11, totalAmount: 167250.25 }
];

/**
 * Analytics data for charts
 */
export const mockAnalyticsData = {
  monthlyTrends: [
    { month: 'Jan', invoices: 45, amount: 85420 },
    { month: 'Feb', invoices: 38, amount: 72150 },
    { month: 'Mar', invoices: 52, amount: 98750 },
    { month: 'Apr', invoices: 61, amount: 115420 },
    { month: 'May', invoices: 48, amount: 89350 },
    { month: 'Jun', invoices: 55, amount: 102680 },
    { month: 'Jul', invoices: 42, amount: 78920 },
    { month: 'Aug', invoices: 58, amount: 108570 },
    { month: 'Sep', invoices: 64, amount: 125480 },
    { month: 'Oct', invoices: 59, amount: 112750 },
    { month: 'Nov', invoices: 67, amount: 135920 },
    { month: 'Dec', invoices: 53, amount: 98450 }
  ],
  categoryBreakdown: [
    { category: 'Construction', amount: 425680, percentage: 32.5 },
    { category: 'Electrical', amount: 285420, percentage: 21.8 },
    { category: 'Plumbing', amount: 198750, percentage: 15.2 },
    { category: 'HVAC', amount: 165890, percentage: 12.7 },
    { category: 'Painting', amount: 89240, percentage: 6.8 },
    { category: 'Roofing', amount: 85500, percentage: 6.5 },
    { category: 'Glazing', amount: 42180, percentage: 3.2 },
    { category: 'Flooring', amount: 17340, percentage: 1.3 }
  ]
};

/**
 * User profile data
 */
export const mockUserProfile = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@rudraprojects.com',
  role: 'Finance Manager',
  department: 'Finance & Accounting',
  avatar: '/avatars/sarah-johnson.jpg',
  permissions: ['view_invoices', 'approve_invoices', 'manage_payments', 'generate_reports'],
  preferences: {
    theme: 'system',
    currency: 'AUD',
    dateFormat: 'dd/mm/yyyy',
    notifications: {
      email: true,
      push: true,
      overdue: true,
      payments: true
    }
  }
};

/**
 * System settings data
 */
export const mockSystemSettings = {
  company: {
    name: 'Rudra Projects and Development',
    tagline: 'The Powerhouse of Real Estate',
    address: {
      street: '123 Business District',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia'
    },
    abn: '12 345 678 901',
    phone: '+61 2 9876 5432',
    email: 'admin@rudraprojects.com',
    website: 'https://rudraprojects.com'
  },
  invoice: {
    defaultDueDays: 30,
    lateFeesEnabled: true,
    lateFeePercentage: 1.5,
    autoReminders: true,
    reminderDays: [7, 3, 1],
    currency: 'AUD',
    taxRate: 10.0
  },
  integrations: {
    sharepoint: {
      enabled: true,
      url: 'https://rudraprojects.sharepoint.com',
      status: 'connected'
    },
    xero: {
      enabled: true,
      status: 'connected'
    },
    outlook: {
      enabled: true,
      status: 'connected'
    }
  }
};