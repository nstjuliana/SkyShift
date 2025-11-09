/**
 * @fileoverview Lambda-specific email sending utility
 * @module lambda/weather-check/email
 * 
 * Uses plain HTML instead of React components for Lambda compatibility
 */

import { Resend } from 'resend';

/**
 * Resend client instance
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Default from email address
 */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SkyShift <onboarding@resend.dev>';

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Generates HTML for weather conflict email
 */
function generateWeatherConflictEmailHTML(params: {
  studentName: string;
  flightDate: string;
  departureLocation: string;
  conflictReason: string;
  viewUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px;">
    <h1 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Weather Alert</h1>
    <p style="margin: 0; color: #78350f;">Your flight may be affected by weather conditions</p>
  </div>
  
  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h2 style="color: #111827; margin-top: 0;">Flight Details</h2>
    <p><strong>Student:</strong> ${params.studentName}</p>
    <p><strong>Date & Time:</strong> ${params.flightDate}</p>
    <p><strong>Departure:</strong> ${params.departureLocation}</p>
  </div>
  
  <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
    <h3 style="color: #991b1b; margin-top: 0;">Weather Concern</h3>
    <p style="margin: 0; color: #7f1d1d;">${params.conflictReason}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${params.viewUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
      View Flight Details & Reschedule Options
    </a>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
    <p style="margin: 0;">This is an automated notification from SkyShift.</p>
    <p style="margin: 5px 0 0 0;">Please review the weather conditions and consider rescheduling if necessary.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends a weather conflict email using plain HTML
 * 
 * @param params - Email parameters
 * @returns Send result
 */
export async function sendWeatherConflictEmail(params: {
  to: string;
  studentName: string;
  flightDate: string;
  departureLocation: string;
  conflictReason: string;
  viewUrl: string;
}): Promise<EmailSendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log(JSON.stringify({
      level: 'warn',
      message: 'RESEND_API_KEY not set, email not sent',
      to: params.to,
      subject: `Weather Alert: Flight on ${params.flightDate}`,
    }));
    return {
      success: true,
      id: 'console-log',
    };
  }

  try {
    const html = generateWeatherConflictEmailHTML(params);
    const subject = `Weather Alert: Flight on ${params.flightDate}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      console.error(JSON.stringify({
        level: 'error',
        message: 'Failed to send email',
        error: error.message || String(error),
        to: params.to,
      }));
      return {
        success: false,
        error: error.message || String(error),
      };
    }

    console.log(JSON.stringify({
      level: 'info',
      message: 'Email sent successfully',
      to: params.to,
      id: data?.id,
    }));

    return {
      success: true,
      id: data?.id || undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({
      level: 'error',
      message: 'Email send failed',
      error: errorMessage,
      to: params.to,
    }));
    return {
      success: false,
      error: errorMessage,
    };
  }
}

