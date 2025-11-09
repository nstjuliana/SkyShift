/**
 * @fileoverview Redirect route for /flights/new to /dashboard/flights/new
 * @module app/flights/new/page
 */

import { redirect } from 'next/navigation';

/**
 * Redirects /flights/new to /dashboard/flights/new
 */
export default function NewFlightRedirect() {
  redirect('/dashboard/flights/new');
}

