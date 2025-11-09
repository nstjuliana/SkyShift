"use strict";
/**
 * @fileoverview Notification service - handles email sending and logging
 * @module services/notification-service
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const db_1 = require("@/lib/db");
const email_1 = require("@/lib/email");
const weather_conflict_1 = __importDefault(require("../../emails/weather-conflict"));
const booking_confirmation_1 = __importDefault(require("../../emails/booking-confirmation"));
const reschedule_confirmation_1 = __importDefault(require("../../emails/reschedule-confirmation"));
const reschedule_request_1 = __importDefault(require("../../emails/reschedule-request"));
/**
 * Notification service
 * Manages email notifications and logging
 */
class NotificationService {
    /**
     * Sends weather conflict email to student and instructor
     *
     * @param booking - Flight booking with student and instructor data
     * @param conflictDetails - Details about the weather conflict
     * @returns Array of send results
     */
    async sendWeatherConflictEmail(booking, conflictDetails) {
        const conflictReason = conflictDetails.violations.join(', ') ||
            conflictDetails.reasons.join(', ') ||
            'Weather conditions may prevent safe flight';
        const flightDate = new Date(booking.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const departureLocation = booking.departureLocation.name || 'Unknown';
        const viewUrl = `${email_1.APP_URL}/dashboard/flights/${booking.id}`;
        const results = [];
        // Send to student
        if (booking.student.email) {
            const result = await (0, email_1.sendEmail)({
                to: booking.student.email,
                subject: `Weather Alert: Flight on ${flightDate}`,
                react: (0, weather_conflict_1.default)({
                    studentName: booking.student.name || 'Student',
                    flightDate,
                    departureLocation,
                    conflictReason,
                    viewUrl,
                }),
            });
            await this.logNotification(booking.studentId, 'WEATHER_CONFLICT', `Weather Alert: Flight on ${flightDate}`, {
                bookingId: booking.id,
                conflictReason,
                flightDate,
                departureLocation,
            }, result.success ? 'SENT' : 'FAILED');
            results.push({ recipient: booking.student.email, ...result });
        }
        // Send to instructor
        if (booking.instructor.email) {
            const result = await (0, email_1.sendEmail)({
                to: booking.instructor.email,
                subject: `Weather Alert: Flight with ${booking.student.name || 'Student'} on ${flightDate}`,
                react: (0, weather_conflict_1.default)({
                    studentName: booking.instructor.name || 'Instructor',
                    flightDate,
                    departureLocation,
                    conflictReason,
                    viewUrl,
                }),
            });
            await this.logNotification(booking.instructorId, 'WEATHER_CONFLICT', `Weather Alert: Flight with ${booking.student.name || 'Student'} on ${flightDate}`, {
                bookingId: booking.id,
                conflictReason,
                flightDate,
                departureLocation,
            }, result.success ? 'SENT' : 'FAILED');
            results.push({ recipient: booking.instructor.email, ...result });
        }
        return results;
    }
    /**
     * Sends booking confirmation email to student and instructor
     *
     * @param booking - Flight booking with student and instructor data
     * @returns Array of send results
     */
    async sendBookingConfirmation(booking) {
        const flightDate = new Date(booking.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const departureLocation = booking.departureLocation.name || 'Unknown';
        const viewUrl = `${email_1.APP_URL}/dashboard/flights/${booking.id}`;
        const results = [];
        // Send to student
        if (booking.student.email) {
            const result = await (0, email_1.sendEmail)({
                to: booking.student.email,
                subject: `Flight Booking Confirmed: ${flightDate}`,
                react: (0, booking_confirmation_1.default)({
                    studentName: booking.student.name || 'Student',
                    instructorName: booking.instructor.name || 'Instructor',
                    flightDate,
                    departureLocation,
                    duration: booking.duration,
                    viewUrl,
                }),
            });
            await this.logNotification(booking.studentId, 'BOOKING_CONFIRMATION', `Flight Booking Confirmed: ${flightDate}`, {
                bookingId: booking.id,
                flightDate,
                departureLocation,
                duration: booking.duration,
            }, result.success ? 'SENT' : 'FAILED');
            results.push({ recipient: booking.student.email, ...result });
        }
        // Send to instructor
        if (booking.instructor.email) {
            const result = await (0, email_1.sendEmail)({
                to: booking.instructor.email,
                subject: `New Flight Booking: ${flightDate}`,
                react: (0, booking_confirmation_1.default)({
                    studentName: booking.instructor.name || 'Instructor',
                    instructorName: booking.student.name || 'Student',
                    flightDate,
                    departureLocation,
                    duration: booking.duration,
                    viewUrl,
                }),
            });
            await this.logNotification(booking.instructorId, 'BOOKING_CONFIRMATION', `New Flight Booking: ${flightDate}`, {
                bookingId: booking.id,
                flightDate,
                departureLocation,
                duration: booking.duration,
            }, result.success ? 'SENT' : 'FAILED');
            results.push({ recipient: booking.instructor.email, ...result });
        }
        return results;
    }
    /**
     * Sends reschedule request email to instructor
     *
     * @param reschedule - Reschedule record
     * @param booking - Original booking
     * @returns Send result
     */
    async sendRescheduleRequest(reschedule, booking) {
        const proposedDate = new Date(reschedule.proposedDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const originalDate = new Date(booking.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const viewUrl = `${email_1.APP_URL}/dashboard/flights/${booking.id}`;
        if (!booking.instructor.email) {
            return { success: false, error: 'Instructor email not found' };
        }
        const result = await (0, email_1.sendEmail)({
            to: booking.instructor.email,
            subject: `Reschedule Request: ${booking.student.name || 'Student'} Flight`,
            react: (0, reschedule_request_1.default)({
                instructorName: booking.instructor.name || 'Instructor',
                studentName: booking.student.name || 'Student',
                originalDate,
                proposedDate,
                reasoning: reschedule.aiReasoning || 'Weather-related reschedule',
                viewUrl,
            }),
        });
        await this.logNotification(booking.instructorId, 'RESCHEDULE_REQUEST', `Reschedule Request: ${booking.student.name || 'Student'} Flight`, {
            rescheduleId: reschedule.id,
            bookingId: booking.id,
            originalDate,
            proposedDate,
        }, result.success ? 'SENT' : 'FAILED');
        return result;
    }
    /**
     * Sends reschedule confirmation email to student and instructor
     *
     * @param oldBooking - Original booking
     * @param newBooking - New booking created from reschedule
     * @returns Array of send results
     */
    async sendRescheduleConfirmation(oldBooking, newBooking) {
        const oldDate = new Date(oldBooking.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const newDate = new Date(newBooking.scheduledDate).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        const departureLocation = newBooking.departureLocation.name || 'Unknown';
        const viewUrl = `${email_1.APP_URL}/dashboard/flights/${newBooking.id}`;
        const results = [];
        // Send to student
        if (oldBooking.student.email) {
            const result = await (0, email_1.sendEmail)({
                to: oldBooking.student.email,
                subject: `Flight Rescheduled: ${newDate}`,
                react: (0, reschedule_confirmation_1.default)({
                    recipientName: oldBooking.student.name || 'Student',
                    oldDate,
                    newDate,
                    departureLocation,
                    duration: newBooking.duration,
                    viewUrl,
                }),
            });
            await this.logNotification(oldBooking.studentId, 'RESCHEDULE_APPROVED', `Flight Rescheduled: ${newDate}`, {
                oldBookingId: oldBooking.id,
                newBookingId: newBooking.id,
                oldDate,
                newDate,
            }, result.success ? 'SENT' : 'FAILED');
            results.push({ recipient: oldBooking.student.email, ...result });
        }
        // Send to instructor
        if (oldBooking.instructor.email) {
            const result = await (0, email_1.sendEmail)({
                to: oldBooking.instructor.email,
                subject: `Flight Rescheduled: ${newDate}`,
                react: (0, reschedule_confirmation_1.default)({
                    recipientName: oldBooking.instructor.name || 'Instructor',
                    oldDate,
                    newDate,
                    departureLocation,
                    duration: newBooking.duration,
                    viewUrl,
                }),
            });
            await this.logNotification(oldBooking.instructorId, 'RESCHEDULE_APPROVED', `Flight Rescheduled: ${newDate}`, {
                oldBookingId: oldBooking.id,
                newBookingId: newBooking.id,
                oldDate,
                newDate,
            }, result.success ? 'SENT' : 'FAILED');
            results.push({ recipient: oldBooking.instructor.email, ...result });
        }
        return results;
    }
    /**
     * Logs a notification to the database
     *
     * @private
     */
    async logNotification(userId, type, subject, content, status) {
        try {
            await db_1.db.notification.create({
                data: {
                    userId,
                    type,
                    subject,
                    content: content,
                    status,
                },
            });
        }
        catch (error) {
            console.error('[Notification Service] Failed to log notification:', error);
            // Don't throw - logging failure shouldn't break the flow
        }
    }
}
// Export singleton instance
exports.notificationService = new NotificationService();
