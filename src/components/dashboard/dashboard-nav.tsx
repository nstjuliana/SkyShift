/**
 * @fileoverview Dashboard navigation component
 * @module components/dashboard/dashboard-nav
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plane, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation items configuration
 */
const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/flights',
    label: 'Flights',
    icon: Plane,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: User,
  },
];

/**
 * Dashboard navigation component
 * 
 * Displays navigation links with active state highlighting
 * 
 * @returns Rendered navigation sidebar
 */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 border-r bg-card p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

