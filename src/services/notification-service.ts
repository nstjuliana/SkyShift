/**
 * @fileoverview Notification service - handles email sending and logging
 * @module services/notification-service
 */

import { db } from '@/lib/db';
import { sendEmail, APP_URL } from '@/lib/email';
import WeatherConflictEmail from '../../emails/weather-conflict';
import BookingConfirmationEmail from '../../emails/booking-confirmation';
import RescheduleConfirmationEmail from '../../emails/reschedule-confirmation';
import RescheduleRequestEmail from '../../emails/reschedule-request';
import type { Booking, Reschedule } from '@prisma/client';
import type { NotificationType, NotificationStatus } from '@prisma/client';

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
  async sendWeatherConflictEmail(
    booking: Booking & {
      student: { name: string | null; email: string };
      instructor: { name: string | null; email: string };
    },
    conflictDetails: {
      violations: string[];
      reasons: string[];
    }
  ) {
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

    const departureLocation = (booking.departureLocation as any).name || 'Unknown';
    const viewUrl = `${APP_URL}/dashboard/flights/${booking.id}`;

    const results = [];

    // Send to student
    if (booking.student.email) {
      const result = await sendEmail({
        to: booking.student.email,
        subject: `Weather Alert: Flight on ${flightDate}`,
        react: WeatherConflictEmail({
          studentName: booking.student.name || 'Student',
          flightDate,
          departureLocation,
          conflictReason,
          viewUrl,
        }),
      });

      await this.logNotification(
        booking.studentId,
        'WEATHER_CONFLICT',
        `Weather Alert: Flight on ${flightDate}`,
        {
          bookingId: booking.id,
          conflictReason,
          flightDate,
          departureLocation,
        },
        result.success ? 'SENT' : 'FAILED'
      );

      results.push({ recipient: booking.student.email, ...result });
    }

    // Send to instructor
    if (booking.instructor.email) {
      const result = await sendEmail({
        to: booking.instructor.email,
        subject: `Weather Alert: Flight with ${booking.student.name || 'Student'} on ${flightDate}`,
        react: WeatherConflictEmail({
          studentName: booking.instructor.name || 'Instructor',
          flightDate,
          departureLocation,
          conflictReason,
          viewUrl,
        }),
      });

      await this.logNotification(
        booking.instructorId,
        'WEATHER_CONFLICT',
        `Weather Alert: Flight with ${booking.student.name || 'Student'} on ${flightDate}`,
        {
          bookingId: booking.id,
          conflictReason,
          flightDate,
          departureLocation,
        },
        result.success ? 'SENT' : 'FAILED'
      );

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
  async sendBookingConfirmation(
    booking: Booking & {
      student: { name: string | null; email: string };
      instructor: { name: string | null; email: string };
    }
  ) {
    const flightDate = new Date(booking.scheduledDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const departureLocation = (booking.departureLocation as any).name || 'Unknown';
    const viewUrl = `${APP_URL}/dashboard/flights/${booking.id}`;

    const results = [];

    // Send to student
    if (booking.student.email) {
      const result = await sendEmail({
        to: booking.student.email,
        subject: `Flight Booking Confirmed: ${flightDate}`,
        react: BookingConfirmationEmail({
          studentName: booking.student.name || 'Student',
          instructorName: booking.instructor.name || 'Instructor',
          flightDate,
          departureLocation,
          duration: booking.duration,
          viewUrl,
        }),
      });

      await this.logNotification(
        booking.studentId,
        'BOOKING_CONFIRMATION',
        `Flight Booking Confirmed: ${flightDate}`,
        {
          bookingId: booking.id,
          flightDate,
          departureLocation,
          duration: booking.duration,
        },
        result.success ? 'SENT' : 'FAILED'
      );

      results.push({ recipient: booking.student.email, ...result });
    }

    // Send to instructor
    if (booking.instructor.email) {
      const result = await sendEmail({
        to: booking.instructor.email,
        subject: `New Flight Booking: ${flightDate}`,
        react: BookingConfirmationEmail({
          studentName: booking.instructor.name || 'Instructor',
          instructorName: booking.student.name || 'Student',
          flightDate,
          departureLocation,
          duration: booking.duration,
          viewUrl,
        }),
      });

      await this.logNotification(
        booking.instructorId,
        'BOOKING_CONFIRMATION',
        `New Flight Booking: ${flightDate}`,
        {
          bookingId: booking.id,
          flightDate,
          departureLocation,
          duration: booking.duration,
        },
        result.success ? 'SENT' : 'FAILED'
      );

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
  async sendRescheduleRequest(
    reschedule: Reschedule,
    booking: Booking & {
      student: { name: string | null; email: string };
      instructor: { name: string | null; email: string };
    }
  ) {
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

    const viewUrl = `${APP_URL}/dashboard/flights/${booking.id}`;

    if (!booking.instructor.email) {
      return { success: false, error: 'Instructor email not found' };
    }

    const result = await sendEmail({
      to: booking.instructor.email,
      subject: `Reschedule Request: ${booking.student.name || 'Student'} Flight`,
      react: RescheduleRequestEmail({
        instructorName: booking.instructor.name || 'Instructor',
        studentName: booking.student.name || 'Student',
        originalDate,
        proposedDate,
        reasoning: reschedule.aiReasoning || 'Weather-related reschedule',
        viewUrl,
      }),
    });

    await this.logNotification(
      booking.instructorId,
      'RESCHEDULE_REQUEST',
      `Reschedule Request: ${booking.student.name || 'Student'} Flight`,
      {
        rescheduleId: reschedule.id,
        bookingId: booking.id,
        originalDate,
        proposedDate,
      },
      result.success ? 'SENT' : 'FAILED'
    );

    return result;
  }

  /**
   * Sends reschedule confirmation email to student and instructor
   * 
   * @param oldBooking - Original booking
   * @param newBooking - New booking created from reschedule
   * @returns Array of send results
   */
  async sendRescheduleConfirmation(
    oldBooking: Booking & {
      student: { name: string | null; email: string };
      instructor: { name: string | null; email: string };
    },
    newBooking: Booking
  ) {
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

    const departureLocation = (newBooking.departureLocation as any).name || 'Unknown';
    const viewUrl = `${APP_URL}/dashboard/flights/${newBooking.id}`;

    const results = [];

    // Send to student
    if (oldBooking.student.email) {
      const result = await sendEmail({
        to: oldBooking.student.email,
        subject: `Flight Rescheduled: ${newDate}`,
        react: RescheduleConfirmationEmail({
          recipientName: oldBooking.student.name || 'Student',
          oldDate,
          newDate,
          departureLocation,
          duration: newBooking.duration,
          viewUrl,
        }),
      });

      await this.logNotification(
        oldBooking.studentId,
        'RESCHEDULE_APPROVED',
        `Flight Rescheduled: ${newDate}`,
        {
          oldBookingId: oldBooking.id,
          newBookingId: newBooking.id,
          oldDate,
          newDate,
        },
        result.success ? 'SENT' : 'FAILED'
      );

      results.push({ recipient: oldBooking.student.email, ...result });
    }

    // Send to instructor
    if (oldBooking.instructor.email) {
      const result = await sendEmail({
        to: oldBooking.instructor.email,
        subject: `Flight Rescheduled: ${newDate}`,
        react: RescheduleConfirmationEmail({
          recipientName: oldBooking.instructor.name || 'Instructor',
          oldDate,
          newDate,
          departureLocation,
          duration: newBooking.duration,
          viewUrl,
        }),
      });

      await this.logNotification(
        oldBooking.instructorId,
        'RESCHEDULE_APPROVED',
        `Flight Rescheduled: ${newDate}`,
        {
          oldBookingId: oldBooking.id,
          newBookingId: newBooking.id,
          oldDate,
          newDate,
        },
        result.success ? 'SENT' : 'FAILED'
      );

      results.push({ recipient: oldBooking.instructor.email, ...result });
    }

    return results;
  }

  /**
   * Logs a notification to the database
   * 
   * @private
   */
  private async logNotification(
    userId: string,
    type: NotificationType,
    subject: string,
    content: Record<string, any>,
    status: NotificationStatus
  ) {
    try {
      await db.notification.create({
        data: {
          userId,
          type,
          subject,
          content: content as any,
          status,
        },
      });
    } catch (error) {
      console.error('[Notification Service] Failed to log notification:', error);
      // Don't throw - logging failure shouldn't break the flow
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

