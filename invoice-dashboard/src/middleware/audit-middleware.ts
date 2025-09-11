import { NextRequest, NextResponse } from 'next/server'
import { createAuditLog, extractRequestMetadata, AuditLogData } from '@/lib/audit-service'

export interface AuditConfig {
  entityType: string
  extractEntityId: (req: NextRequest, res?: NextResponse) => string | null
  extractEntityData?: (req: NextRequest, res?: NextResponse) => any
  skipActions?: string[]
  customContext?: (req: NextRequest, res?: NextResponse) => any
}

// Middleware factory for automatic audit logging
export function withAuditLogging(config: AuditConfig) {
  return function auditMiddleware(
    handler: (req: NextRequest, context?: any) => Promise<NextResponse>
  ) {
    return async function wrappedHandler(req: NextRequest, context?: any): Promise<NextResponse> {
      const startTime = Date.now()
      let auditData: Partial<AuditLogData> = {}
      let response: NextResponse
      let error: Error | null = null

      try {
        // Extract request metadata
        const metadata = extractRequestMetadata(req)
        
        // Determine the action based on HTTP method
        const action = getActionFromMethod(req.method)
        
        // Skip audit logging for certain actions if configured
        if (config.skipActions?.includes(action)) {
          return await handler(req, context)
        }

        // Extract entity ID
        const entityId = config.extractEntityId(req)
        
        // If we can't extract entity ID, proceed without auditing (for LIST operations, etc.)
        if (!entityId && !['CREATE', 'LIST'].includes(action)) {
          return await handler(req, context)
        }

        // Prepare base audit data
        auditData = {
          entityType: config.entityType,
          entityId: entityId || 'bulk',
          action,
          ...metadata
        }

        // For UPDATE/DELETE operations, capture current state before modification
        let previousValues = null
        if (['UPDATE', 'DELETE'].includes(action) && entityId) {
          try {
            // This would typically query the database to get current state
            // Implementation depends on your specific entity type
            previousValues = await getCurrentEntityState(config.entityType, entityId)
            auditData.previousValues = previousValues
          } catch (err) {
            console.warn(`Failed to capture previous state for ${config.entityType}:${entityId}`, err)
          }
        }

        // Execute the main handler
        response = await handler(req, context)

        // If the operation was successful, capture the new state
        if (response.ok) {
          // Extract new values from response or request body
          let newValues = null
          
          if (action === 'CREATE' || action === 'UPDATE') {
            try {
              // Try to extract data from response body
              const responseClone = response.clone()
              const responseText = await responseClone.text()
              
              if (responseText) {
                try {
                  newValues = JSON.parse(responseText)
                } catch {
                  // Response might not be JSON, try extracting from request
                  newValues = config.extractEntityData?.(req, response) || 
                             await extractRequestBody(req)
                }
              }
            } catch (err) {
              console.warn('Failed to extract new values from response', err)
            }
          }

          auditData.newValues = newValues

          // Add custom business context
          if (config.customContext) {
            auditData.businessContext = config.customContext(req, response)
          }

          // Create audit log entry
          await createAuditLog(auditData as AuditLogData)
        }

        return response

      } catch (err) {
        error = err as Error
        
        // Log failed operations too
        try {
          await createAuditLog({
            ...auditData,
            action: `${auditData.action}_FAILED`,
            businessContext: {
              ...(auditData.businessContext || {}),
              errorMessage: error.message,
              errorStack: error.stack,
              processingTime: Date.now() - startTime
            }
          } as AuditLogData)
        } catch (auditErr) {
          console.error('Failed to create audit log for failed operation', auditErr)
        }

        // Re-throw the original error
        throw error
      }
    }
  }
}

// Helper function to determine action from HTTP method
function getActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE'
    case 'GET':
      return 'READ'
    case 'PUT':
    case 'PATCH':
      return 'UPDATE'
    case 'DELETE':
      return 'DELETE'
    default:
      return method.toUpperCase()
  }
}

// Helper function to get current entity state (to be implemented per entity type)
async function getCurrentEntityState(entityType: string, entityId: string): Promise<any> {
  // This would typically use your ORM/database client to fetch current state
  // For now, return null - this should be implemented based on your specific entities
  
  // Example implementation for invoices:
  if (entityType === 'invoice') {
    try {
      const { prisma } = await import('@/lib/prisma')
      return await prisma.invoice.findUnique({
        where: { id: entityId }
      })
    } catch (err) {
      console.warn(`Failed to fetch current state for invoice ${entityId}`, err)
      return null
    }
  }
  
  return null
}

// Helper function to extract request body
async function extractRequestBody(req: NextRequest): Promise<any> {
  try {
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      // Clone the request to avoid consuming the body
      const requestClone = req.clone()
      return await requestClone.json()
    }
    
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const requestClone = req.clone()
      const formData = await requestClone.formData()
      const data: any = {}
      
      for (const [key, value] of formData.entries()) {
        data[key] = value
      }
      
      return data
    }
    
    return null
  } catch (err) {
    console.warn('Failed to extract request body', err)
    return null
  }
}

// Predefined configurations for common entities

// Invoice audit configuration
export const invoiceAuditConfig: AuditConfig = {
  entityType: 'invoice',
  extractEntityId: (req: NextRequest) => {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    
    // For routes like /api/invoices/[id]
    const idIndex = pathParts.indexOf('invoices') + 1
    return pathParts[idIndex] || null
  },
  extractEntityData: (req: NextRequest) => {
    // This will be called to extract invoice-specific data
    return null // Will be extracted from request body in the main function
  },
  customContext: (req: NextRequest, res?: NextResponse) => {
    // Extract invoice-specific business context
    try {
      const url = new URL(req.url)
      const searchParams = url.searchParams
      
      return {
        source: 'dashboard_api',
        userAgent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        timestamp: new Date().toISOString(),
        apiEndpoint: url.pathname,
        queryParams: Object.fromEntries(searchParams.entries())
      }
    } catch {
      return {}
    }
  }
}

// User audit configuration
export const userAuditConfig: AuditConfig = {
  entityType: 'user',
  extractEntityId: (req: NextRequest) => {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    
    // For routes like /api/users/[id]
    const idIndex = pathParts.indexOf('users') + 1
    return pathParts[idIndex] || null
  },
  skipActions: ['READ'], // Don't audit user profile reads for privacy
  customContext: (req: NextRequest) => ({
    source: 'user_management',
    timestamp: new Date().toISOString()
  })
}

// Usage example:
// export default withAuditLogging(invoiceAuditConfig)(async function handler(req: NextRequest) {
//   // Your API logic here
//   return NextResponse.json({ success: true })
// })