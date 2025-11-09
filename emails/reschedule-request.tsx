/**
 * @fileoverview Reschedule request email template
 * @module emails/reschedule-request
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

interface RescheduleRequestEmailProps {
  instructorName: string;
  studentName: string;
  originalDate: string;
  proposedDate: string;
  reasoning: string;
  viewUrl: string;
}

export default function RescheduleRequestEmail({
  instructorName,
  studentName,
  originalDate,
  proposedDate,
  reasoning,
  viewUrl,
}: RescheduleRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reschedule Request</Heading>
          <Text style={text}>Hi {instructorName},</Text>
          <Text style={text}>
            {studentName} has requested to reschedule their flight:
          </Text>
          <Section style={codeBox}>
            <Text style={label}>Original Date:</Text>
            <Text style={value}>{originalDate}</Text>
            <Text style={label}>Proposed Date:</Text>
            <Text style={newValue}>{proposedDate}</Text>
            <Text style={label}>Reason:</Text>
            <Text style={value}>{reasoning}</Text>
          </Section>
          <Text style={text}>
            Please review this request and approve or reject it.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={viewUrl}>
              Review and Approve
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You can also review this request in your dashboard.
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

const newValue = {
  color: '#007ee6',
  fontSize: '14px',
  fontWeight: 'bold',
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

