"use strict";
/**
 * @fileoverview Booking confirmation email template
 * @module emails/booking-confirmation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BookingConfirmationEmail;
const components_1 = require("@react-email/components");
function BookingConfirmationEmail({ studentName, instructorName, flightDate, departureLocation, duration, viewUrl, }) {
    return (<components_1.Html>
      <components_1.Head />
      <components_1.Body style={main}>
        <components_1.Container style={container}>
          <components_1.Heading style={h1}>✈️ Flight Booking Confirmed</components_1.Heading>
          <components_1.Text style={text}>Hi {studentName},</components_1.Text>
          <components_1.Text style={text}>
            Your flight lesson has been successfully scheduled!
          </components_1.Text>
          <components_1.Section style={codeBox}>
            <components_1.Text style={label}>Date & Time:</components_1.Text>
            <components_1.Text style={value}>{flightDate}</components_1.Text>
            <components_1.Text style={label}>Location:</components_1.Text>
            <components_1.Text style={value}>{departureLocation}</components_1.Text>
            <components_1.Text style={label}>Duration:</components_1.Text>
            <components_1.Text style={value}>{duration} hours</components_1.Text>
            <components_1.Text style={label}>Instructor:</components_1.Text>
            <components_1.Text style={value}>{instructorName}</components_1.Text>
          </components_1.Section>
          <components_1.Text style={text}>
            We'll monitor weather conditions and notify you if there are any concerns. You can view your booking details at any time using the link below.
          </components_1.Text>
          <components_1.Section style={buttonContainer}>
            <a href={viewUrl} style={link}>
              View Booking Details
            </a>
          </components_1.Section>
          <components_1.Hr style={hr}/>
          <components_1.Text style={footer}>
            See you on the flight line!
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
