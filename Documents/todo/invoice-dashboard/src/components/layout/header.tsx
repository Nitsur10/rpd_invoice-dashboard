'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RPDLogo } from '@/components/ui/rpd-logo';
import { User, Bell, Search, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200/20 dark:border-slate-700/20">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - RPD Branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <RPDLogo size="md" className="flex-shrink-0" />
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Invoice Dashboard
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Real Property Development
              </p>
            </div>
          </div>
        </div>

        {/* Center - Status Indicator */}
        <div className="hidden md:flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            System Online
          </Badge>
        </div>
        
        {/* Right side - User Actions */}
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Search className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors relative"
          >
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">3</span>
            </div>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm"
            className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-1 ml-2">
            <Button 
              variant="ghost" 
              className="h-9 px-3 space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-brand-navy to-brand-navy-light flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  RPD Admin
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Administrator
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
