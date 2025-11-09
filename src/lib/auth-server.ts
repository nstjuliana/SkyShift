/**
 * @fileoverview Server-side auth helper for NextAuth v5
 * @module lib/auth-server
 *
 * Re-exports auth function for server-side usage
 */

import { auth } from '@/app/api/auth/[...nextauth]/route';

/**
 * Server-side auth function
 * Use this in Server Components and API routes
 */
export const getServerSession = auth;

