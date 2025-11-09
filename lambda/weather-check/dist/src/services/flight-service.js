"use strict";
/**
 * @fileoverview Flight booking service - handles flight CRUD and business logic
 * @module services/flight-service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightService = void 0;
const db_1 = require("@/lib/db");
const server_1 = require("@trpc/server");
const notification_service_1 = require("./notification-service");
/**
 * Flight booking service
 * Manages flight creation, updates, cancellations, and status tracking
 */
class FlightService {
    /**
     * Lists all flights for a user with optional filtering
     *
     * @param userId - User ID to filter flights
     * @param userRole - User role for authorization
     * @param options - Filtering options (status, pagination)
     * @returns Array of flight bookings
     *
     * @throws TRPCError if database query fails
     */
    async listFlights(userId, userRole, options = {}) {
        try {
            // Build where clause based on role
            const where = {};
            if (userRole === 'STUDENT') {
                where.studentId = userId;
            }
            else if (userRole === 'INSTRUCTOR') {
                where.instructorId = userId;
            }
            // ADMIN can see all flights (no filter)
            if (options.status) {
                where.status = options.status;
            }
            if (options.startDate || options.endDate) {
                where.scheduledDate = {};
                if (options.startDate) {
                    where.scheduledDate.gte = options.startDate;
                }
                if (options.endDate) {
                    where.scheduledDate.lte = options.endDate;
                }
            }
            const flights = await db_1.db.booking.findMany({
                where,
                take: options.limit || 20,
                skip: options.offset || 0,
                orderBy: { scheduledDate: 'asc' },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            trainingLevel: true,
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
            return flights;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch flights',
                cause: error,
            });
        }
    }
    /**
     * Gets a single flight by ID with authorization check
     *
     * @param id - Flight ID
     * @param userId - User ID requesting the flight
     * @param userRole - User role for authorization
     * @returns Flight booking with related data
     *
     * @throws TRPCError if flight not found or unauthorized
     */
    async getFlightById(id, userId, userRole) {
        try {
            const flight = await db_1.db.booking.findUnique({
                where: { id },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            trainingLevel: true,
                        },
                    },
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    weatherLogs: {
                        orderBy: { checkedAt: 'desc' },
                        take: 1, // Get most recent weather check
                    },
                },
            });
            if (!flight) {
                throw new server_1.TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Flight not found',
                });
            }
            // Check authorization
            if (userRole === 'STUDENT' && flight.studentId !== userId) {
                throw new server_1.TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this flight',
                });
            }
            if (userRole === 'INSTRUCTOR' && flight.instructorId !== userId) {
                throw new server_1.TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to view this flight',
                });
            }
            return flight;
        }
        catch (error) {
            if (error instanceof server_1.TRPCError) {
                throw error;
            }
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch flight',
                cause: error,
            });
        }
    }
    /**
     * Creates a new flight booking
     * Validates date is in future and instructor availability
     *
     * @param userId - User creating the booking
     * @param data - Flight booking data
     * @returns Created flight with generated ID
     *
     * @throws TRPCError if validation fails or creation fails
     */
    async createFlight(userId, data) {
        try {
            // Verify user exists in database
            const user = await db_1.db.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new server_1.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'User not found. Please log out and log back in.',
                });
            }
            // Validate date is in future
            if (data.scheduledDate <= new Date()) {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Scheduled date must be in the future',
                });
            }
            // Verify instructor exists
            const instructor = await db_1.db.user.findUnique({
                where: { id: data.instructorId },
            });
            if (!instructor) {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Instructor not found',
                });
            }
            if (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN') {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Selected user is not an instructor',
                });
            }
            // Check instructor availability (simple check - no double booking)
            const conflictingFlight = await db_1.db.booking.findFirst({
                where: {
                    instructorId: data.instructorId,
                    scheduledDate: {
                        gte: new Date(data.scheduledDate.getTime() - data.duration * 60 * 60 * 1000),
                        lte: new Date(data.scheduledDate.getTime() + data.duration * 60 * 60 * 1000),
                    },
                    status: {
                        notIn: ['CANCELLED', 'COMPLETED'],
                    },
                },
            });
            if (conflictingFlight) {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Instructor is not available at the requested time',
                });
            }
            // Create booking - use userId as studentId (from authenticated session)
            const flight = await db_1.db.booking.create({
                data: {
                    ...data,
                    studentId: userId, // Use authenticated user's ID as studentId
                    status: 'SCHEDULED',
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            trainingLevel: true,
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
            // Send confirmation email
            try {
                await notification_service_1.notificationService.sendBookingConfirmation(flight);
            }
            catch (error) {
                console.error('[Flight Service] Failed to send confirmation email:', error);
                // Don't throw - email failure shouldn't break booking creation
            }
            return flight;
        }
        catch (error) {
            if (error instanceof server_1.TRPCError) {
                throw error;
            }
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create flight',
                cause: error,
            });
        }
    }
    /**
     * Updates flight status and cancellation probability
     *
     * @param data - Update data with flight ID
     * @returns Updated flight
     *
     * @throws TRPCError if flight not found or update fails
     */
    async updateFlightStatus(data) {
        try {
            const flight = await db_1.db.booking.update({
                where: { id: data.id },
                data: {
                    status: data.status,
                    cancellationProbability: data.cancellationProbability,
                    riskLevel: data.riskLevel,
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            trainingLevel: true,
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
            return flight;
        }
        catch (error) {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update flight status',
                cause: error,
            });
        }
    }
}
// Export singleton instance
exports.flightService = new FlightService();
