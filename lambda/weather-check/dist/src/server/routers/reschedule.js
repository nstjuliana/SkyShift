"use strict";
/**
 * @fileoverview tRPC router for reschedule operations
 * @module server/routers/reschedule
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rescheduleRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const server_1 = require("@trpc/server");
const ai_reschedule_service_1 = require("@/services/ai-reschedule-service");
const flight_service_1 = require("@/services/flight-service");
const notification_service_1 = require("@/services/notification-service");
const reschedule_1 = require("@/types/reschedule");
const db_1 = require("@/lib/db");
/**
 * Reschedule management router
 * Handles AI-generated reschedule options and approval workflow
 */
exports.rescheduleRouter = (0, trpc_1.router)({
    /**
     * Generate AI reschedule options for a booking
     *
     * @returns Array of 3 reschedule options
     */
    generateOptions: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        bookingId: zod_1.z.string().cuid(),
    }))
        .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        // Verify user has access to this booking
        const booking = await flight_service_1.flightService.getFlightById(input.bookingId, userId, userRole);
        if (booking.status !== 'AT_RISK') {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'Reschedule options can only be generated for flights at risk',
            });
        }
        // Generate AI options
        const options = await ai_reschedule_service_1.aiRescheduleService.generateRescheduleOptions(input.bookingId);
        return {
            options,
            bookingId: input.bookingId,
        };
    }),
    /**
     * Student accepts a reschedule option
     * Creates a Reschedule record with PENDING_INSTRUCTOR status
     *
     * @returns Created reschedule record
     */
    acceptOption: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        bookingId: zod_1.z.string().cuid(),
        rescheduleData: reschedule_1.rescheduleOptionSchema,
    }))
        .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        // Verify user has access to this booking
        const booking = await flight_service_1.flightService.getFlightById(input.bookingId, userId, userRole);
        // Verify user is the student
        if (booking.studentId !== userId) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Only the student can accept a reschedule option',
            });
        }
        // Check if reschedule already exists
        const existingReschedule = await db_1.db.reschedule.findFirst({
            where: {
                originalBookingId: input.bookingId,
                status: {
                    in: ['PENDING_STUDENT', 'PENDING_INSTRUCTOR'],
                },
            },
        });
        if (existingReschedule) {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: 'A reschedule request is already pending for this booking',
            });
        }
        // Create reschedule record
        const reschedule = await db_1.db.reschedule.create({
            data: {
                originalBookingId: input.bookingId,
                proposedDate: new Date(input.rescheduleData.suggestedDate),
                proposedDuration: input.rescheduleData.suggestedDuration,
                aiReasoning: input.rescheduleData.reasoning,
                weatherForecast: input.rescheduleData.weatherSummary,
                status: 'PENDING_INSTRUCTOR',
                studentConfirmedAt: new Date(),
            },
        });
        // Send notification to instructor
        try {
            await notification_service_1.notificationService.sendRescheduleRequest(reschedule, booking);
        }
        catch (error) {
            console.error('[Reschedule Router] Failed to send notification:', error);
            // Don't throw - notification failure shouldn't break reschedule creation
        }
        return reschedule;
    }),
    /**
     * Instructor approves or rejects a reschedule request
     * If approved, creates new booking and marks old as RESCHEDULED
     *
     * @returns Updated reschedule and new booking (if approved)
     */
    respondToReschedule: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        rescheduleId: zod_1.z.string().cuid(),
        approved: zod_1.z.boolean(),
        rejectionReason: zod_1.z.string().optional(),
    }))
        .mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        // Verify user is instructor
        if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Only instructors can approve reschedule requests',
            });
        }
        // Fetch reschedule with booking
        const reschedule = await db_1.db.reschedule.findUnique({
            where: { id: input.rescheduleId },
        });
        if (!reschedule) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Reschedule request not found',
            });
        }
        const booking = await db_1.db.booking.findUnique({
            where: { id: reschedule.originalBookingId },
            include: {
                student: true,
                instructor: true,
            },
        });
        if (!booking) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Original booking not found',
            });
        }
        // Verify user is the instructor for this booking
        if (booking.instructorId !== userId && userRole !== 'ADMIN') {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You are not the instructor for this booking',
            });
        }
        if (reschedule.status !== 'PENDING_INSTRUCTOR') {
            throw new server_1.TRPCError({
                code: 'BAD_REQUEST',
                message: `Reschedule is not pending instructor approval. Current status: ${reschedule.status}`,
            });
        }
        if (input.approved) {
            // Approve: Create new booking and mark old as RESCHEDULED
            const newBooking = await db_1.db.booking.create({
                data: {
                    studentId: booking.studentId,
                    instructorId: booking.instructorId,
                    scheduledDate: reschedule.proposedDate,
                    status: 'SCHEDULED',
                    trainingLevel: booking.trainingLevel,
                    duration: reschedule.proposedDuration,
                    departureLocation: booking.departureLocation,
                    destinationLocation: booking.destinationLocation,
                    notes: `Rescheduled from booking ${booking.id}`,
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            // Update old booking
            await db_1.db.booking.update({
                where: { id: booking.id },
                data: {
                    status: 'RESCHEDULED',
                },
            });
            // Update reschedule status
            const updatedReschedule = await db_1.db.reschedule.update({
                where: { id: input.rescheduleId },
                data: {
                    status: 'APPROVED',
                    instructorConfirmedAt: new Date(),
                },
            });
            // Send confirmation emails
            try {
                await notification_service_1.notificationService.sendRescheduleConfirmation(booking, newBooking);
            }
            catch (error) {
                console.error('[Reschedule Router] Failed to send confirmation emails:', error);
                // Don't throw - email failure shouldn't break reschedule approval
            }
            return {
                reschedule: updatedReschedule,
                newBooking,
                approved: true,
            };
        }
        else {
            // Reject: Update reschedule status
            const updatedReschedule = await db_1.db.reschedule.update({
                where: { id: input.rescheduleId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: input.rejectionReason || 'Rejected by instructor',
                    instructorConfirmedAt: new Date(),
                },
            });
            return {
                reschedule: updatedReschedule,
                newBooking: null,
                approved: false,
            };
        }
    }),
    /**
     * List pending reschedules for instructor
     *
     * @returns Array of pending reschedule requests
     */
    listPending: trpc_1.protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Only instructors can view pending reschedules',
            });
        }
        const reschedules = await db_1.db.reschedule.findMany({
            where: {
                status: 'PENDING_INSTRUCTOR',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Fetch booking details for each reschedule
        const reschedulesWithBookings = await Promise.all(reschedules.map(async (reschedule) => {
            const booking = await db_1.db.booking.findUnique({
                where: { id: reschedule.originalBookingId },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            // Filter by instructor if not admin
            if (userRole !== 'ADMIN' && booking?.instructorId !== userId) {
                return null;
            }
            return {
                ...reschedule,
                booking,
            };
        }));
        return reschedulesWithBookings.filter((r) => r !== null);
    }),
    /**
     * Get reschedule details by ID
     *
     * @returns Reschedule with booking details
     */
    getById: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        rescheduleId: zod_1.z.string().cuid(),
    }))
        .query(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const userRole = ctx.session.user.role;
        const reschedule = await db_1.db.reschedule.findUnique({
            where: { id: input.rescheduleId },
        });
        if (!reschedule) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Reschedule not found',
            });
        }
        const booking = await db_1.db.booking.findUnique({
            where: { id: reschedule.originalBookingId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Booking not found',
            });
        }
        // Check authorization
        if (userRole === 'STUDENT' && booking.studentId !== userId) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to view this reschedule',
            });
        }
        if (userRole === 'INSTRUCTOR' && booking.instructorId !== userId) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'You do not have permission to view this reschedule',
            });
        }
        return {
            ...reschedule,
            booking,
        };
    }),
});
