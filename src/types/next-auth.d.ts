/**
 * @fileoverview NextAuth.js type augmentation
 * @module types/next-auth
 * 
 * Extends NextAuth types to include custom fields
 */

import 'next-auth';
import type { UserRole, TrainingLevel, TemperatureUnit } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      trainingLevel: TrainingLevel | null;
      temperatureUnit: TemperatureUnit;
    };
  }

  interface User {
    role: UserRole;
    trainingLevel: TrainingLevel | null;
    temperatureUnit: TemperatureUnit;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    trainingLevel: TrainingLevel | null;
    temperatureUnit: TemperatureUnit;
  }
}

