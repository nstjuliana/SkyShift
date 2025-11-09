/**
 * @fileoverview tRPC context creation
 * @module server/context
 */

import { getServerSession } from '@/lib/auth-server';
import { db } from '@/lib/db';

/**
 * Context type for tRPC procedures
 */
export interface Context {
  db: typeof db;
  session: Awaited<ReturnType<typeof getServerSession>>;
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

