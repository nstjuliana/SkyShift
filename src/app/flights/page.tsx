/**
 * @fileoverview Redirect route for /flights to /dashboard/flights
 * @module app/flights/page
 */

import { redirect } from 'next/navigation';

/**
 * Redirects /flights to /dashboard/flights
 */
export default function FlightsRedirect() {
  redirect('/dashboard/flights');
}

