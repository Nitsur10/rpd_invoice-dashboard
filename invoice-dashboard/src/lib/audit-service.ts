import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export interface AuditLogData {
  entityType: string
  entityId: string
  action: string
  userId?: string | null
  previousValues?: any
  newValues?: any
  businessContext?: {
    invoiceNumber?: string
    vendorName?: string
    amount?: number
    statusChange?: string
    [key: string]: any
  }
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    // Prepare changes object with before/after values
    const changes: any = {
      action: data.action,
      timestamp: new Date().toISOString(),
    }

    if (data.previousValues) {
      changes.previousValues = data.previousValues
    }

    if (data.newValues) {
      changes.newValues = data.newValues
    }

    if (data.businessContext) {
      changes.businessContext = data.businessContext
    }

    // If we have both previous and new values, calculate the diff
    if (data.previousValues && data.newValues) {
      changes.fieldChanges = calculateFieldChanges(data.previousValues, data.newValues)
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      }
    })

    console.log(`Audit log created: ${data.action} on ${data.entityType} ${data.entityId}`)
    return auditLog

  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break the main operation
    return null
  }
}

// Helper function to calculate field-level changes
function calculateFieldChanges(oldValues: any, newValues: any): any {
  const changes: any = {}
  
  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
  
  for (const key of allKeys) {
    const oldValue = oldValues[key]
    const newValue = newValues[key]
    
    // Skip if values are the same
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = {
        from: oldValue,
        to: newValue
      }
    }
  }
  
  return changes
}

// Middleware helper to extract request metadata
export function extractRequestMetadata(request: NextRequest) {
  return {
    ipAddress: request.ip || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1',
    userAgent: request.headers.get('user-agent') || 'Unknown',
    userId: request.headers.get('x-user-id') || null, // Will be set by auth middleware
  }
}

// Specific audit functions for common operations
export async function auditInvoiceCreate(invoiceData: any, userId?: string, metadata?: any) {
  return createAuditLog({
    entityType: 'invoice',
    entityId: invoiceData.id,
    action: 'CREATE',
    userId,
    newValues: invoiceData,
    businessContext: {
      invoiceNumber: invoiceData.invoiceNumber,
      vendorName: invoiceData.vendor,
      amount: invoiceData.amount,
    },
    ...metadata,
  })
}

export async function auditInvoiceUpdate(
  invoiceId: string,
  previousValues: any,
  newValues: any,
  userId?: string,
  metadata?: any
) {
  return createAuditLog({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'UPDATE',
    userId,
    previousValues,
    newValues,
    businessContext: {
      invoiceNumber: newValues.invoiceNumber || previousValues.invoiceNumber,
      vendorName: newValues.vendor || previousValues.vendor,
      amount: newValues.amount || previousValues.amount,
      statusChange: previousValues.paymentStatus !== newValues.paymentStatus 
        ? `${previousValues.paymentStatus} → ${newValues.paymentStatus}` 
        : undefined,
    },
    ...metadata,
  })
}

export async function auditPaymentStatusChange(
  invoiceId: string,
  oldStatus: string,
  newStatus: string,
  invoiceNumber: string,
  amount: number,
  userId?: string,
  metadata?: any
) {
  return createAuditLog({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'PAYMENT_STATUS_CHANGE',
    userId,
    previousValues: { paymentStatus: oldStatus },
    newValues: { paymentStatus: newStatus },
    businessContext: {
      invoiceNumber,
      amount,
      statusChange: `${oldStatus} → ${newStatus}`,
      paymentUpdate: true,
    },
    ...metadata,
  })
}

// Query functions for audit trails
export async function getAuditTrail(entityType: string, entityId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
  })
}

export async function getRecentActivity(limit: number = 20) {
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
  })
}

export async function getUserActivity(userId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
  })
}