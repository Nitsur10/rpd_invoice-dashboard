'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RPDLogo } from '@/components/ui/rpd-logo';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  BarChart3,
  Settings,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: FileText,
    badge: '247',
  },
  {
    name: 'Kanban Board',
    href: '/kanban',
    icon: Kanban,
    badge: null,
  },
  {
    name: 'API Status',
    href: '/status',
    icon: Activity,
    badge: null,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('pb-12 min-h-screen w-full', className)}>
      <div className="space-y-6 py-6">
        <div className="px-6">
          <div className="flex items-center space-x-3">
            <RPDLogo size="lg" className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[oklch(0.25_0.08_240)]">
                Invoice Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The Powerhouse of Real Estate
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-3">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium focus-enhanced theme-transition',
                    'relative overflow-hidden',
                    'transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5',
                    isActive
                      ? 'text-white shadow-lg hover:shadow-xl bg-[oklch(0.25_0.08_240)] shadow-[0_10px_15px_-3px_oklch(0.25_0.08_240_/_0.3)]'
                      : 'text-slate-700 dark:text-slate-300 hover:shadow-lg hover:bg-[oklch(0.65_0.12_80_/_0.1)]'
                  )}
                >
                  <div className="flex items-center">
                    <Icon className={cn(
                      "mr-3 h-5 w-5 transition-all duration-300 ease-out relative z-10",
                      "group-hover:scale-110 group-hover:rotate-3",
                      isActive 
                        ? "text-white" 
                        : "text-[oklch(0.45_0.04_240)] group-hover:text-[oklch(0.65_0.12_80)] group-hover:drop-shadow-sm"
                    )} />
                  
                    <span className="truncate relative z-10 group-hover:font-semibold transition-all duration-300 ease-out">{item.name}</span>
                  </div>
                  
                  {item.badge && (
                    <div className={cn(
                      "ml-auto rounded-full px-2 py-1 text-xs font-medium relative z-10",
                      "transition-all duration-300 ease-out group-hover:scale-110",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[oklch(0.85_0.08_80)] text-[oklch(0.25_0.08_240)]"
                    )}>
                      {item.badge}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="px-6">
          <div className="rounded-xl p-4 border bg-[oklch(0.65_0.12_80_/_0.1)] border-[oklch(0.65_0.12_80_/_0.2)]">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[oklch(0.65_0.12_80)]" />
              <div>
                <p className="text-sm font-medium text-[oklch(0.25_0.08_240)]">
                  Monthly Growth
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  +23.5% from last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
