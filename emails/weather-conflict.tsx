/**
 * @fileoverview Weather conflict email template
 * @module emails/weather-conflict
 */

import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr,
} from '@react-email/components';

interface WeatherConflictEmailProps {
  studentName: string;
  flightDate: string;
  departureLocation: string;
  conflictReason: string;
  viewUrl: string;
}

export default function WeatherConflictEmail({
  studentName,
  flightDate,
  departureLocation,
  conflictReason,
  viewUrl,
}: WeatherConflictEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Weather Alert for Your Flight</Heading>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>
            Unfortunately, weather conditions may prevent your scheduled flight:
          </Text>
          <Section style={codeBox}>
            <Text style={label}>Date:</Text>
            <Text style={value}>{flightDate}</Text>
            <Text style={label}>Location:</Text>
            <Text style={value}>{departureLocation}</Text>
            <Text style={label}>Issue:</Text>
            <Text style={value}>{conflictReason}</Text>
          </Section>
          <Text style={text}>
            Our AI has generated alternative scheduling options for you. Click the button below to view them and select a new time that works better.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={viewUrl}>
              View Reschedule Options
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            If you have any questions, please contact your flight instructor.
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

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
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

