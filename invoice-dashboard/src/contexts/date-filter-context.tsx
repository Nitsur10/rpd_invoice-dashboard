'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from '@/components/ui/date-range-picker';

interface DateFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isDateInRange: (date: Date) => boolean;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
}

interface DateFilterProviderProps {
  children: ReactNode;
}

const defaultDateRange: DateRange = {
  key: 'last_30_days',
  label: 'Last 30 days',
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  to: new Date()
};

export function DateFilterProvider({ children }: DateFilterProviderProps) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);

  const isDateInRange = (date: Date) => {
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
    const toDate = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
    
    return compareDate >= fromDate && compareDate <= toDate;
  };

  const value = {
    dateRange,
    setDateRange,
    isDateInRange
  };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
}