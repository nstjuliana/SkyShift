/**
 * @fileoverview Email client setup using Resend
 * @module lib/email
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';

/**
 * Resend client instance
 * Configured with API key from environment variables
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Default from email address
 * Uses Resend's default sender which doesn't require domain verification
 * If RESEND_FROM_EMAIL is set and is a resend.dev domain, use it
 * Otherwise, always use onboarding@resend.dev to avoid verification issues
 */
export const FROM_EMAIL = (() => {
  const envEmail = process.env.RESEND_FROM_EMAIL;
  // If env email is set and is a resend.dev domain, use it
  if (envEmail && envEmail.includes('@resend.dev')) {
    return envEmail;
  }
  // Always default to onboarding@resend.dev (no verification needed)
  return 'SkyShift <onboarding@resend.dev>';
})();

/**
 * Application URL for email links
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: unknown;
}

/**
 * Sends an email using Resend
 * 
 * @param params - Email parameters
 * @param params.to - Recipient email address
 * @param params.subject - Email subject
 * @param params.react - React Email component
 * @returns Send result with success status and message ID
 * 
 * @example
 * ```ts
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome',
 *   react: <WelcomeEmail name="John" />,
 * });
 * ```
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<EmailSendResult> {
  // If RESEND_API_KEY is not set, log to console instead
  if (!process.env.RESEND_API_KEY) {
    console.log('\n========== EMAIL (Console Preview) ==========');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('From:', FROM_EMAIL);
    console.log('\n--- Email HTML Preview ---');
    
    try {
      const html = await render(params.react);
      console.log(html);
      console.log('\n--- End Email Preview ---');
      console.log('💡 Tip: Set RESEND_API_KEY to send real emails');
      console.log('💡 Tip: Visit /api/emails/preview to view emails in browser');
    } catch (error) {
      console.error('Error rendering email:', error);
      console.log('React Component:', params.react);
    }
    
    console.log('==========================================\n');
    return {
      success: true,
      id: 'console-log',
    };
  }

  try {
    // Validate email parameters before sending
    if (!params.to || !params.to.includes('@')) {
      throw new Error(`Invalid email address: ${params.to}`);
    }

    if (!params.subject || params.subject.trim().length === 0) {
      throw new Error('Email subject is required');
    }

    console.log('[Email] Attempting to send:', {
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      hasReactComponent: !!params.react,
    });

    // Resend SDK returns { data, error } structure
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      react: params.react,
    });

    // Check for errors from Resend
    if (error) {
      console.error('[Email] Resend error:', error);
      return {
        success: false,
        error: error.message || error,
      };
    }

    // Extract email ID from response
    // Resend returns { id: "..." } in the data property
    const emailId = data?.id || null;
    
    if (!emailId) {
      console.warn('[Email] No ID returned from Resend:', { data, to: params.to });
    }

    console.log('[Email] Sent successfully:', {
      to: params.to,
      subject: params.subject,
      id: emailId || 'no-id-returned',
    });

    return {
      success: true,
      id: emailId || undefined,
    };
  } catch (error) {
    console.error('[Email] Send failed with exception:', error);
    
    // Extract meaningful error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : String(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

