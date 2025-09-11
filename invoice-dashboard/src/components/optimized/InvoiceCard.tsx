// Optimized invoice card with React.memo and proper prop comparison
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Invoice } from '@/lib/types';

interface InvoiceCardProps {
  invoice: Invoice;
  onUpdate?: (invoiceId: string, newStatus: string) => void;
  isSelected?: boolean;
}

// Memoized invoice card component to prevent unnecessary re-renders
export const InvoiceCard = memo<InvoiceCardProps>(({ 
  invoice, 
  onUpdate, 
  isSelected = false 
}) => {
  const handleStatusUpdate = (newStatus: string) => {
    onUpdate?.(invoice.id, newStatus);
  };

  const StatusIcon = invoice.status === 'paid' 
    ? Icons.checkCircle 
    : invoice.status === 'overdue' 
    ? Icons.alertTriangle 
    : Icons.clock;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-sm">{invoice.invoiceNumber}</h4>
              <Badge variant={
                invoice.status === 'paid' ? 'default' :
                invoice.status === 'overdue' ? 'destructive' : 'secondary'
              }>
                <StatusIcon className="h-3 w-3 mr-1" />
                {invoice.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{invoice.vendorName}</p>
            <p className="text-lg font-bold text-emerald-600">
              ${invoice.amount.toFixed(2)} AUD
            </p>
          </div>
          
          <div className="flex flex-col space-y-1">
            {invoice.invoiceUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => window.open(invoice.invoiceUrl, '_blank')}
              >
                <Icons.externalLink className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleStatusUpdate(
                invoice.status === 'paid' ? 'pending' : 'paid'
              )}
            >
              <Icons.moreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Due: {invoice.dueDate.toLocaleDateString()}</span>
          <span className="truncate ml-2">{invoice.description}</span>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.invoice.id === nextProps.invoice.id &&
    prevProps.invoice.status === nextProps.invoice.status &&
    prevProps.invoice.amount === nextProps.invoice.amount &&
    prevProps.isSelected === nextProps.isSelected
  );
});

InvoiceCard.displayName = 'InvoiceCard';