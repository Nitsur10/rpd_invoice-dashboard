import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Audit logging helper
export async function createAuditLog({
  entityType,
  entityId,
  action,
  userId,
  changes,
  ipAddress,
  userAgent,
}: {
  entityType: string
  entityId: string
  action: string
  userId?: string | null
  changes: any
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        userId,
        changes,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break the main operation
  }
}