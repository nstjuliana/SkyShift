"use strict";
/**
 * @fileoverview Weather conflict email template
 * @module emails/weather-conflict
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WeatherConflictEmail;
const components_1 = require("@react-email/components");
function WeatherConflictEmail({ studentName, flightDate, departureLocation, conflictReason, viewUrl, }) {
    return (<components_1.Html>
      <components_1.Head />
      <components_1.Body style={main}>
        <components_1.Container style={container}>
          <components_1.Heading style={h1}>⚠️ Weather Alert for Your Flight</components_1.Heading>
          <components_1.Text style={text}>Hi {studentName},</components_1.Text>
          <components_1.Text style={text}>
            Unfortunately, weather conditions may prevent your scheduled flight:
          </components_1.Text>
          <components_1.Section style={codeBox}>
            <components_1.Text style={label}>Date:</components_1.Text>
            <components_1.Text style={value}>{flightDate}</components_1.Text>
            <components_1.Text style={label}>Location:</components_1.Text>
            <components_1.Text style={value}>{departureLocation}</components_1.Text>
            <components_1.Text style={label}>Issue:</components_1.Text>
            <components_1.Text style={value}>{conflictReason}</components_1.Text>
          </components_1.Section>
          <components_1.Text style={text}>
            Our AI has generated alternative scheduling options for you. Click the button below to view them and select a new time that works better.
          </components_1.Text>
          <components_1.Section style={buttonContainer}>
            <components_1.Button style={button} href={viewUrl}>
              View Reschedule Options
            </components_1.Button>
          </components_1.Section>
          <components_1.Hr style={hr}/>
          <components_1.Text style={footer}>
            If you have any questions, please contact your flight instructor.
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
const button = {
    backgroundColor: '#007ee6',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
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
