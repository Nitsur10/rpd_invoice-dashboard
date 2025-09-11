// Optimized table component with dynamic imports
import { memo, Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy table components
const DataTablePagination = lazy(() => 
  import('@/components/invoices/data-table-pagination').then(m => ({ default: m.DataTablePagination }))
);

const DataTableToolbar = lazy(() => 
  import('@/components/invoices/data-table-toolbar').then(m => ({ default: m.DataTableToolbar }))
);

const DataTableViewOptions = lazy(() => 
  import('@/components/invoices/data-table-view-options').then(m => ({ default: m.DataTableViewOptions }))
);

interface OptimizedTableProps {
  children: React.ReactNode;
}

export const OptimizedTableWrapper = memo(({ children }: OptimizedTableProps) => {
  return (
    <div className="space-y-4">
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <DataTableToolbar />
      </Suspense>
      
      <div className="rounded-md border bg-white dark:bg-slate-900">
        {children}
      </div>
      
      <Suspense fallback={<Skeleton className="h-12 w-full" />}>
        <DataTablePagination />
      </Suspense>
    </div>
  );
});

OptimizedTableWrapper.displayName = 'OptimizedTableWrapper';