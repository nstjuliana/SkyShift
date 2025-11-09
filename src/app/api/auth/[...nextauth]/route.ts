/**
 * @fileoverview NextAuth.js API route handler
 * @module app/api/auth/[...nextauth]/route
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth handler instance
 */
const { handlers } = NextAuth(authOptions);

/**
 * Next.js route handlers
 * NextAuth v5 beta exports handlers object with GET and POST
 * Note: Only GET and POST can be exported from route handlers
 */
export const { GET, POST } = handlers;

