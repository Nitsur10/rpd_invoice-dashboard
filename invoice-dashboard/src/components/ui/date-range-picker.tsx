'use client';

import * as React from 'react';
import { CalendarDays, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
  key: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (dateRange: DateRange) => void;
  className?: string;
}

const predefinedRanges: DateRange[] = [
  {
    key: 'last_7_days',
    label: 'Last 7 days',
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    key: 'last_30_days',
    label: 'Last 30 days',
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    key: 'last_3_months',
    label: 'Last 3 months',
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    key: 'last_6_months',
    label: 'Last 6 months',
    from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    key: 'last_year',
    label: 'Last year',
    from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    to: new Date()
  },
  {
    key: 'this_month',
    label: 'This month',
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  },
  {
    key: 'this_year',
    label: 'This year',
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  },
  {
    key: 'all_time',
    label: 'All time',
    from: new Date('2024-01-01'),
    to: new Date()
  }
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<DateRange>(
    value || predefinedRanges[1] // Default to "Last 30 days"
  );
  const [customFromDate, setCustomFromDate] = React.useState('');
  const [customToDate, setCustomToDate] = React.useState('');

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range);
    onChange?.(range);
    setIsOpen(false);
  };

  const handleClear = () => {
    const allTimeRange = predefinedRanges.find(r => r.key === 'all_time')!;
    setSelectedRange(allTimeRange);
    onChange?.(allTimeRange);
  };

  const handleCustomDateApply = () => {
    if (customFromDate && customToDate) {
      const fromDate = new Date(customFromDate);
      const toDate = new Date(customToDate);
      
      if (fromDate <= toDate) {
        const customRange: DateRange = {
          key: 'custom',
          label: 'Custom Range',
          from: fromDate,
          to: toDate
        };
        setSelectedRange(customRange);
        onChange?.(customRange);
        setIsOpen(false);
      } else {
        alert('From date must be before or equal to To date');
      }
    } else {
      alert('Please select both from and to dates');
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  React.useEffect(() => {
    if (value) {
      setSelectedRange(value);
    }
  }, [value]);

  // Initialize custom dates with current selection
  React.useEffect(() => {
    if (selectedRange) {
      setCustomFromDate(formatDateForInput(selectedRange.from));
      setCustomToDate(formatDateForInput(selectedRange.to));
    }
  }, [selectedRange]);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-start text-left font-normal min-w-64 hover:bg-slate-50"
        style={{
          color: 'oklch(0.25 0.08 240)',
          borderColor: 'oklch(0.75 0.06 240)',
          backgroundColor: 'oklch(0.98 0.01 240)'
        }}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        <span className="flex-1">
          {selectedRange.label}
        </span>
        <Badge 
          variant="outline" 
          className="ml-2 text-xs"
          style={{
            color: 'oklch(0.35 0.08 200)',
            borderColor: 'oklch(0.75 0.06 200)',
            backgroundColor: 'oklch(0.90 0.04 200)'
          }}
        >
          {formatDate(selectedRange.from)} - {formatDate(selectedRange.to)}
        </Badge>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute top-full left-0 mt-2 z-50 min-w-80 shadow-xl border glass-card" 
                style={{
                  backgroundColor: 'oklch(0.98 0.01 240)',
                  borderColor: 'oklch(0.85 0.04 240)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 20px 25px -5px oklch(0.25 0.08 240 / 0.1), 0 10px 10px -5px oklch(0.25 0.08 240 / 0.04)'
                }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm" style={{color: 'oklch(0.1 0.1 240)'}}>
                  Select Date Range
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs"
                    style={{color: 'oklch(0.35 0.04 240)'}}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {predefinedRanges.map((range) => (
                  <Button
                    key={range.key}
                    variant={selectedRange.key === range.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleRangeSelect(range)}
                    className="justify-start text-left font-normal"
                    style={{
                      backgroundColor: selectedRange.key === range.key 
                        ? 'oklch(0.25 0.08 240)' 
                        : 'transparent',
                      color: selectedRange.key === range.key 
                        ? 'white' 
                        : 'oklch(0.25 0.08 240)'
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>

              {/* Custom Date Selection */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium mb-3" style={{color: 'oklch(0.1 0.1 240)'}}>
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Custom Date Range
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{color: 'oklch(0.25 0.08 240)'}}>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: 'oklch(0.75 0.06 240)',
                        backgroundColor: 'oklch(0.99 0.01 240)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{color: 'oklch(0.25 0.08 240)'}}>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: 'oklch(0.75 0.06 240)',
                        backgroundColor: 'oklch(0.99 0.01 240)'
                      }}
                    />
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={handleCustomDateApply}
                  className="w-full text-white"
                  style={{
                    backgroundColor: 'oklch(0.25 0.08 240)',
                    borderColor: 'oklch(0.25 0.08 240)'
                  }}
                >
                  Apply Custom Range
                </Button>
              </div>

              {/* Current Selection Display */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-xs" style={{color: 'oklch(0.35 0.04 240)'}}>
                  Selected: <span className="font-medium">{selectedRange.label}</span>
                </div>
                <div className="text-xs mt-1" style={{color: 'oklch(0.35 0.04 240)'}}>
                  {formatDate(selectedRange.from)} to {formatDate(selectedRange.to)}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}