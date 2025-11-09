/**
 * @fileoverview NextAuth.js API route handler
 * @module app/api/auth/[...nextauth]/route
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth handler instance
 */
const { handlers, auth } = NextAuth(authOptions);

/**
 * Server-side auth function
 * Use this in Server Components and API routes
 */
export { auth };

/**
 * Next.js route handlers
 * NextAuth v5 beta exports handlers object with GET and POST
 */
export const { GET, POST } = handlers;

