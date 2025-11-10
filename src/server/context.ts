/**
 * @fileoverview tRPC context creation
 * @module server/context
 */

import { getServerSession } from '@/lib/auth-server';
import { db } from '@/lib/db';
import type { Session } from 'next-auth';

/**
 * Context type for tRPC procedures
 */
export interface Context {
  db: typeof db;
  session: Session | null;
}

/**
 * Create tRPC context for each request
 *
 * @returns Context object with database and session
 */
export async function createContext(): Promise<Context> {
  const session = await getServerSession();

  return {
    db,
    session,
  };
}

