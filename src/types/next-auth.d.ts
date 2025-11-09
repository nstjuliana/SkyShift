/**
 * @fileoverview NextAuth.js type augmentation
 * @module types/next-auth
 * 
 * Extends NextAuth types to include custom fields
 */

import 'next-auth';
import type { UserRole, TrainingLevel } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      trainingLevel: TrainingLevel | null;
    };
  }

  interface User {
    role: UserRole;
    trainingLevel: TrainingLevel | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    trainingLevel: TrainingLevel | null;
  }
}

