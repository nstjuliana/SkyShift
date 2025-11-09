/**
 * @fileoverview Server-side auth helper for NextAuth v5
 * @module lib/auth-server
 *
 * Creates auth instance for server-side usage
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth instance for server-side usage
 */
const { auth } = NextAuth(authOptions);

/**
 * Server-side auth function
 * Use this in Server Components and API routes
 */
export const getServerSession = auth;

