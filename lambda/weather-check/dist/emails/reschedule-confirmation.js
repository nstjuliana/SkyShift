"use strict";
/**
 * @fileoverview Reschedule confirmation email template
 * @module emails/reschedule-confirmation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RescheduleConfirmationEmail;
const components_1 = require("@react-email/components");
function RescheduleConfirmationEmail({ recipientName, oldDate, newDate, departureLocation, duration, viewUrl, }) {
    return (<components_1.Html>
      <components_1.Head />
      <components_1.Body style={main}>
        <components_1.Container style={container}>
          <components_1.Heading style={h1}>✅ Flight Rescheduled</components_1.Heading>
          <components_1.Text style={text}>Hi {recipientName},</components_1.Text>
          <components_1.Text style={text}>
            Your flight has been successfully rescheduled!
          </components_1.Text>
          <components_1.Section style={codeBox}>
            <components_1.Text style={label}>Previous Date:</components_1.Text>
            <components_1.Text style={oldValue}>{oldDate}</components_1.Text>
            <components_1.Text style={label}>New Date:</components_1.Text>
            <components_1.Text style={newValue}>{newDate}</components_1.Text>
            <components_1.Text style={label}>Location:</components_1.Text>
            <components_1.Text style={value}>{departureLocation}</components_1.Text>
            <components_1.Text style={label}>Duration:</components_1.Text>
            <components_1.Text style={value}>{duration} hours</components_1.Text>
          </components_1.Section>
          <components_1.Text style={text}>
            Please update your calendar with the new date and time. We'll continue monitoring weather conditions for the new scheduled time.
          </components_1.Text>
          <components_1.Section style={buttonContainer}>
            <a href={viewUrl} style={link}>
              View Updated Booking
            </a>
          </components_1.Section>
          <components_1.Hr style={hr}/>
          <components_1.Text style={footer}>
            Thank you for your flexibility!
          </components_1.Text>
        </components_1.Container>
      </components_1.Body>
    </components_1.Html>);
}
// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};
const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
};
const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    margin: '16px 0',
};
const codeBox = {
    background: '#f4f4f4',
    borderRadius: '4px',
    margin: '16px 0',
    padding: '16px',
};
const label = {
    color: '#666',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '8px 0 4px',
};
const value = {
    color: '#333',
    fontSize: '14px',
    margin: '0 0 12px',
};
const oldValue = {
    color: '#999',
    fontSize: '14px',
    margin: '0 0 12px',
    textDecoration: 'line-through',
};
const newValue = {
    color: '#007ee6',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 12px',
};
const buttonContainer = {
    padding: '27px 0 27px',
};
const link = {
    color: '#007ee6',
    fontSize: '16px',
    textDecoration: 'underline',
};
const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};
const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
};
