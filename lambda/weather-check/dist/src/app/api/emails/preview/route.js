"use strict";
/**
 * @fileoverview Email preview endpoint for testing emails
 * @module app/api/emails/preview/route
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const render_1 = require("@react-email/render");
const react_1 = __importDefault(require("react"));
// From src/app/api/emails/preview/route.tsx to emails/ (root level)
// Path: ../../../../../ goes from preview -> emails -> api -> app -> src -> root
const weather_conflict_1 = __importDefault(require("../../../../../emails/weather-conflict"));
const booking_confirmation_1 = __importDefault(require("../../../../../emails/booking-confirmation"));
const reschedule_request_1 = __importDefault(require("../../../../../emails/reschedule-request"));
const reschedule_confirmation_1 = __importDefault(require("../../../../../emails/reschedule-confirmation"));
const email_1 = require("@/lib/email");
/**
 * Email preview route
 * GET /api/emails/preview?type=<emailType>
 *
 * Available types:
 * - weather-conflict
 * - booking-confirmation
 * - reschedule-request
 * - reschedule-confirmation
 */
async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const emailType = searchParams.get('type');
    const appUrl = email_1.APP_URL;
    // If no type specified, show index page
    if (!emailType) {
        const emailTypes = [
            {
                type: 'weather-conflict',
                name: 'Weather Conflict Alert',
                description: 'Sent to students when weather conditions may prevent their flight',
            },
            {
                type: 'booking-confirmation',
                name: 'Booking Confirmation',
                description: 'Sent to students and instructors when a flight is booked',
            },
            {
                type: 'reschedule-request',
                name: 'Reschedule Request',
                description: 'Sent to instructors when a student requests a reschedule',
            },
            {
                type: 'reschedule-confirmation',
                name: 'Reschedule Confirmation',
                description: 'Sent to students and instructors when a reschedule is approved',
            },
        ];
        const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Previews - SkyShift</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
      h1 { color: #333; margin-bottom: 10px; }
      .subtitle { color: #666; margin-bottom: 30px; }
      .email-list { display: grid; gap: 15px; }
      .email-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6; }
      .email-card h2 { margin: 0 0 8px 0; color: #333; font-size: 18px; }
      .email-card p { margin: 0 0 12px 0; color: #666; font-size: 14px; }
      .email-card a { display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px; }
      .email-card a:hover { background: #2563eb; }
    </style>
  </head>
  <body>
    <h1>📧 Email Previews</h1>
    <p class="subtitle">Preview all email templates used in SkyShift</p>
    <div class="email-list">
      ${emailTypes.map((email) => `
        <div class="email-card">
          <h2>${email.name}</h2>
          <p>${email.description}</p>
          <a href="/api/emails/preview?type=${email.type}" target="_blank">View Preview →</a>
        </div>
      `).join('')}
    </div>
  </body>
</html>`;
        return new server_1.NextResponse(indexHtml, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    }
    // Sample data for preview
    const sampleData = {
        studentName: 'John Doe',
        instructorName: 'Jane Smith',
        flightDate: 'Wednesday, November 12, 2025 at 3:47 PM',
        originalDate: 'Wednesday, November 12, 2025 at 3:47 PM',
        proposedDate: 'Friday, November 14, 2025 at 2:00 PM',
        departureLocation: 'John F. Kennedy International (KJFK)',
        duration: 1.5,
        conflictReason: 'Wind speed 12.4 kt exceeds maximum of 10 kt, Crosswind 3.0 kt exceeds maximum of 5 kt',
        reasoning: 'Weather conditions are not suitable for safe flight. The AI has identified better weather windows.',
        viewUrl: `${appUrl}/dashboard/flights/sample-id`,
    };
    let emailComponent;
    let subject = '';
    switch (emailType) {
        case 'weather-conflict':
            emailComponent = (<weather_conflict_1.default studentName={sampleData.studentName} flightDate={sampleData.flightDate} departureLocation={sampleData.departureLocation} conflictReason={sampleData.conflictReason} viewUrl={sampleData.viewUrl}/>);
            subject = '⚠️ Weather Alert for Your Flight';
            break;
        case 'booking-confirmation':
            emailComponent = (<booking_confirmation_1.default studentName={sampleData.studentName} instructorName={sampleData.instructorName} flightDate={sampleData.flightDate} departureLocation={sampleData.departureLocation} duration={sampleData.duration} viewUrl={sampleData.viewUrl}/>);
            subject = 'Flight Booking Confirmed';
            break;
        case 'reschedule-request':
            emailComponent = (<reschedule_request_1.default instructorName={sampleData.instructorName} studentName={sampleData.studentName} originalDate={sampleData.originalDate} proposedDate={sampleData.proposedDate} reasoning={sampleData.reasoning} viewUrl={sampleData.viewUrl}/>);
            subject = 'Reschedule Request';
            break;
        case 'reschedule-confirmation':
            emailComponent = (<reschedule_confirmation_1.default recipientName={sampleData.studentName} oldDate={sampleData.originalDate} newDate={sampleData.proposedDate} departureLocation={sampleData.departureLocation} duration={sampleData.duration} viewUrl={sampleData.viewUrl}/>);
            subject = 'Flight Rescheduled Successfully';
            break;
        default:
            return server_1.NextResponse.json({ error: `Unknown email type: ${emailType}` }, { status: 400 });
    }
    try {
        const html = await (0, render_1.render)(emailComponent);
        // Wrap the email HTML with a form to send test emails
        const htmlWithForm = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Preview: ${subject} - SkyShift</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
      .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
      .header { background: #3b82f6; color: white; padding: 20px; }
      .header h1 { margin: 0 0 8px 0; font-size: 24px; }
      .header p { margin: 0; opacity: 0.9; font-size: 14px; }
      .send-form { padding: 20px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
      .form-group { display: flex; gap: 10px; align-items: flex-end; }
      .form-group label { display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px; color: #374151; }
      .form-group input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
      .form-group input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
      .form-group button { padding: 8px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
      .form-group button:hover { background: #2563eb; }
      .form-group button:disabled { background: #9ca3af; cursor: not-allowed; }
      .message { margin-top: 12px; padding: 12px; border-radius: 6px; font-size: 14px; }
      .message.success { background: #d1fae5; color: #065f46; border: 1px solid #10b981; }
      .message.error { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
      .email-preview { padding: 20px; }
      .back-link { display: inline-block; margin-bottom: 20px; color: #3b82f6; text-decoration: none; font-size: 14px; }
      .back-link:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${subject}</h1>
        <p>Preview and test email template</p>
      </div>
      <div class="send-form">
        <a href="/api/emails/preview" class="back-link">← Back to Email List</a>
        <form id="sendForm" onsubmit="sendTestEmail(event)">
          <div class="form-group">
            <div style="flex: 1;">
              <label for="testEmail">Send test email to:</label>
              <input type="email" id="testEmail" name="email" placeholder="your-email@example.com" required />
            </div>
            <button type="submit" id="sendButton">Send Test Email</button>
          </div>
          <div id="message"></div>
        </form>
      </div>
      <div class="email-preview">
        ${html}
      </div>
    </div>
    <script>
      async function sendTestEmail(event) {
        event.preventDefault();
        const form = event.target;
        const emailInput = document.getElementById('testEmail');
        const sendButton = document.getElementById('sendButton');
        const messageDiv = document.getElementById('message');
        const email = emailInput.value;
        
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';
        messageDiv.innerHTML = '';
        
        try {
          const response = await fetch('/api/emails/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: '${emailType}',
              to: email
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            if (data.id === 'console-log') {
              messageDiv.innerHTML = '<div class="message success">✓ Email logged to console! <strong>RESEND_API_KEY is not set</strong>, so no actual email was sent. Check your server console/terminal to see the email HTML. To send real emails, add RESEND_API_KEY to your .env file.</div>';
            } else {
              const emailId = data.id && data.id !== 'unknown' ? 'Email ID: ' + data.id : '';
              messageDiv.innerHTML = '<div class="message success">✓ Email sent successfully! Check your inbox (and spam folder).' + (emailId ? ' ' + emailId : '') + '</div>';
            }
            emailInput.value = '';
          } else {
            messageDiv.innerHTML = '<div class="message error">✗ Failed to send email: ' + (data.error || 'Unknown error') + '</div>';
          }
        } catch (error) {
          messageDiv.innerHTML = '<div class="message error">✗ Error: ' + error.message + '</div>';
        } finally {
          sendButton.disabled = false;
          sendButton.textContent = 'Send Test Email';
        }
      }
    </script>
  </body>
</html>`;
        return new server_1.NextResponse(htmlWithForm, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });
    }
    catch (error) {
        console.error('Error rendering email:', error);
        return server_1.NextResponse.json({ error: 'Failed to render email', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
/**
 * POST handler for sending test emails
 * POST /api/emails/preview
 * Body: { type: string, to: string }
 */
async function POST(request) {
    try {
        const body = await request.json();
        const { type, to } = body;
        if (!type || !to) {
            return server_1.NextResponse.json({ success: false, error: 'Missing required fields: type and to' }, { status: 400 });
        }
        const appUrl = email_1.APP_URL;
        const sampleData = {
            studentName: 'John Doe',
            instructorName: 'Jane Smith',
            flightDate: 'Wednesday, November 12, 2025 at 3:47 PM',
            originalDate: 'Wednesday, November 12, 2025 at 3:47 PM',
            proposedDate: 'Friday, November 14, 2025 at 2:00 PM',
            departureLocation: 'John F. Kennedy International (KJFK)',
            duration: 1.5,
            conflictReason: 'Wind speed 12.4 kt exceeds maximum of 10 kt, Crosswind 3.0 kt exceeds maximum of 5 kt',
            reasoning: 'Weather conditions are not suitable for safe flight. The AI has identified better weather windows.',
            viewUrl: `${appUrl}/dashboard/flights/sample-id`,
        };
        let emailComponent;
        let subject = '';
        switch (type) {
            case 'weather-conflict':
                emailComponent = react_1.default.createElement(weather_conflict_1.default, {
                    studentName: sampleData.studentName,
                    flightDate: sampleData.flightDate,
                    departureLocation: sampleData.departureLocation,
                    conflictReason: sampleData.conflictReason,
                    viewUrl: sampleData.viewUrl,
                });
                subject = '⚠️ Weather Alert for Your Flight';
                break;
            case 'booking-confirmation':
                emailComponent = react_1.default.createElement(booking_confirmation_1.default, {
                    studentName: sampleData.studentName,
                    instructorName: sampleData.instructorName,
                    flightDate: sampleData.flightDate,
                    departureLocation: sampleData.departureLocation,
                    duration: sampleData.duration,
                    viewUrl: sampleData.viewUrl,
                });
                subject = 'Flight Booking Confirmed';
                break;
            case 'reschedule-request':
                emailComponent = react_1.default.createElement(reschedule_request_1.default, {
                    instructorName: sampleData.instructorName,
                    studentName: sampleData.studentName,
                    originalDate: sampleData.originalDate,
                    proposedDate: sampleData.proposedDate,
                    reasoning: sampleData.reasoning,
                    viewUrl: sampleData.viewUrl,
                });
                subject = 'Reschedule Request';
                break;
            case 'reschedule-confirmation':
                emailComponent = react_1.default.createElement(reschedule_confirmation_1.default, {
                    recipientName: sampleData.studentName,
                    oldDate: sampleData.originalDate,
                    newDate: sampleData.proposedDate,
                    departureLocation: sampleData.departureLocation,
                    duration: sampleData.duration,
                    viewUrl: sampleData.viewUrl,
                });
                subject = 'Flight Rescheduled Successfully';
                break;
            default:
                return server_1.NextResponse.json({ success: false, error: `Unknown email type: ${type}` }, { status: 400 });
        }
        const result = await (0, email_1.sendEmail)({
            to,
            subject: `[TEST] ${subject}`,
            react: emailComponent,
        });
        if (result.success) {
            return server_1.NextResponse.json({
                success: true,
                message: result.id === 'console-log'
                    ? 'Email logged to console (RESEND_API_KEY not set)'
                    : `Email sent successfully! ID: ${result.id}`,
                id: result.id,
            });
        }
        else {
            return server_1.NextResponse.json({ success: false, error: result.error || 'Failed to send email' }, { status: 500 });
        }
    }
    catch (error) {
        console.error('Error sending test email:', error);
        return server_1.NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
