'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getConsolidatedDashboardStats } from '@/lib/real-consolidated-data';

export function Header() {
  // Get real-time invoice statistics
  const stats = getConsolidatedDashboardStats();
  
  return (
    <header className="h-16">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center flex-1 space-x-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search invoices, vendors, amounts..."
              className="pl-10 h-10 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30">
              {stats.pendingPayments} Active
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30">
              {stats.overduePayments} Overdue
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
            
            <Button 
              variant="ghost" 
              className="h-9 px-3 space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Admin User
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Premium Plan
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}