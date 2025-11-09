/**
 * @fileoverview tRPC router for user operations
 * @module server/routers/users
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import type { TemperatureUnit } from '@prisma/client';

/**
 * User management router
 * Handles user profile operations
 */
export const usersRouter = router({
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

