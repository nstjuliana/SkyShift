"use strict";
/**
 * @fileoverview tRPC router for user operations
 * @module server/routers/users
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const db_1 = require("@/lib/db");
const server_1 = require("@trpc/server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * User management router
 * Handles user profile operations
 */
exports.usersRouter = (0, trpc_1.router)({
    /**
     * Register a new user
     *
     * @returns Created user (without password)
     */
    register: trpc_1.publicProcedure
        .input(zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        name: zod_1.z.string().optional(),
    }))
        .mutation(async ({ input }) => {
        // Check if user already exists
        const existingUser = await db_1.db.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'An account with this email already exists',
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 10);
        // Create user
        const user = await db_1.db.user.create({
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
    updateTemperatureUnit: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        temperatureUnit: zod_1.z.enum(['FAHRENHEIT', 'CELSIUS']),
    }))
        .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const updatedUser = await db_1.db.user.update({
            where: { id: userId },
            data: {
                temperatureUnit: input.temperatureUnit,
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
    getProfile: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const user = await db_1.db.user.findUnique({
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
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            });
        }
        return user;
    }),
});
