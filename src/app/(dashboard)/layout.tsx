/**
 * @fileoverview Dashboard layout with authentication check
 * @module app/(dashboard)/layout
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

/**
 * Dashboard layout component
 *
 * Protects dashboard routes and provides navigation
 *
 * @param children - Child components to render
 * @returns Dashboard layout with header and navigation
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

