/**
 * @fileoverview Reschedule confirmation email template
 * @module emails/reschedule-confirmation
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

interface RescheduleConfirmationEmailProps {
  recipientName: string;
  oldDate: string;
  newDate: string;
  departureLocation: string;
  duration: number;
  viewUrl: string;
}

export default function RescheduleConfirmationEmail({
  recipientName,
  oldDate,
  newDate,
  departureLocation,
  duration,
  viewUrl,
}: RescheduleConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Flight Rescheduled</Heading>
          <Text style={text}>Hi {recipientName},</Text>
          <Text style={text}>
            Your flight has been successfully rescheduled!
          </Text>
          <Section style={codeBox}>
            <Text style={label}>Previous Date:</Text>
            <Text style={oldValue}>{oldDate}</Text>
            <Text style={label}>New Date:</Text>
            <Text style={newValue}>{newDate}</Text>
            <Text style={label}>Location:</Text>
            <Text style={value}>{departureLocation}</Text>
            <Text style={label}>Duration:</Text>
            <Text style={value}>{duration} hours</Text>
          </Section>
          <Text style={text}>
            Please update your calendar with the new date and time. We'll continue monitoring weather conditions for the new scheduled time.
          </Text>
          <Section style={buttonContainer}>
            <a href={viewUrl} style={link}>
              View Updated Booking
            </a>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Thank you for your flexibility!
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

