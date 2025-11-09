/**
 * @fileoverview Home page - redirects to dashboard
 * @module app/page
 */

import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';

/**
 * Home page component
 *
 * Redirects authenticated users to dashboard, others to login
 *
 * @returns Redirect component
 */
export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

