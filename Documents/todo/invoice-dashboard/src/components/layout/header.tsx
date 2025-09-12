'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center flex-1" />
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
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
                  Dashboard
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
