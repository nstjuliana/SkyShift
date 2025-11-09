/**
 * @fileoverview Booking confirmation email template
 * @module emails/booking-confirmation
 */

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components';

interface BookingConfirmationEmailProps {
  studentName: string;
  instructorName: string;
  flightDate: string;
  departureLocation: string;
  duration: number;
  viewUrl: string;
}

export default function BookingConfirmationEmail({
  studentName,
  instructorName,
  flightDate,
  departureLocation,
  duration,
  viewUrl,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✈️ Flight Booking Confirmed</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>
            Your flight lesson has been successfully scheduled!
          </Text>
          <Section style={codeBox}>
            <Text style={label}>Date & Time:</Text>
            <Text style={value}>{flightDate}</Text>
            <Text style={label}>Location:</Text>
            <Text style={value}>{departureLocation}</Text>
            <Text style={label}>Duration:</Text>
            <Text style={value}>{duration} hours</Text>
            <Text style={label}>Instructor:</Text>
            <Text style={value}>{instructorName}</Text>
          </Section>
          <Text style={text}>
            We'll monitor weather conditions and notify you if there are any concerns. You can view your booking details at any time using the link below.
          </Text>
          <Section style={buttonContainer}>
            <a href={viewUrl} style={link}>
              View Booking Details
            </a>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            See you on the flight line!
          </Text>
        </Container>
      </Body>
    </Html>
  );
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

