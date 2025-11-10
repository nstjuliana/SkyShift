/**
 * @fileoverview NextAuth.js configuration for SkyShift
 * @module lib/auth
 *
 * Configured with credentials provider and JWT sessions
 */

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

/**
 * NextAuth configuration options
 */
export const authOptions = {
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === 'development'
      ? 'development-secret-key-minimum-32-characters-long-for-nextauth'
      : undefined),
  // Trust host for development and when AUTH_URL is not set
  trustHost: true,
  // Note: Credentials provider requires JWT strategy, not database sessions
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * Authorize user with email and password
       * 
       * @param credentials - User credentials
       * @returns User object if valid, null otherwise
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          trainingLevel: user.trainingLevel,
          temperatureUnit: user.temperatureUnit,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Add custom fields to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.trainingLevel = user.trainingLevel;
        token.temperatureUnit = user.temperatureUnit;
      }
      return token;
    },
    /**
     * Add custom fields to session from JWT token
     */
    async session({ session, token }: { session: any; token: any }) {
      // Ensure session.user exists
      if (!session.user) {
        session.user = {};
      }
      
      // Populate user data from token
      if (token) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) || session.user.name || null;
        session.user.email = (token.email as string) || session.user.email || null;
        session.user.role = token.role || 'USER';
        session.user.trainingLevel = token.trainingLevel;
        session.user.temperatureUnit = token.temperatureUnit || 'FAHRENHEIT';
      }
      
      return session;
    },
  },
} satisfies NextAuthConfig;

