/**
 * @fileoverview tRPC router for user operations
 * @module server/routers/users
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import type { TemperatureUnit } from '@prisma/client';

/**
 * User management router
 * Handles user profile operations
 */
export const usersRouter = router({
  /**
   * Register a new user
   * 
   * @returns Created user (without password)
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await db.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
          role: 'STUDENT', // Default role
          trainingLevel: 'STUDENT', // Default training level
          emailVerified: new Date(), // Auto-verify for now (can add email verification later)
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          trainingLevel: true,
          temperatureUnit: true,
          createdAt: true,
        },
      });

      return user;
    }),

  /**
   * Update user temperature unit preference
   * 
   * @returns Updated user
   */
  updateTemperatureUnit: protectedProcedure
    .input(
      z.object({
        temperatureUnit: z.enum(['FAHRENHEIT', 'CELSIUS']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          temperatureUnit: input.temperatureUnit as TemperatureUnit,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          trainingLevel: true,
          temperatureUnit: true,
        },
      });

      return updatedUser;
    }),

  /**
   * Get current user profile
   * 
   * @returns Current user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        trainingLevel: true,
        temperatureUnit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),
});

