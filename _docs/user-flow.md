# User Flow Document: Weather Cancellation & AI Rescheduling

## Overview
This document maps the user journeys through the Flight Schedule Pro application, detailing how different features connect and interact to deliver a seamless experience for managing weather-impacted flight lessons.

---

## User Types

### Primary Users
1. **Students** - Pilots at various training levels (Student Pilot, Private Pilot, Instrument Rated)
2. **Instructors** - Flight instructors managing their schedule and students
3. **Administrators** - System operators monitoring overall flight operations

---

## Core User Journeys

### Journey 1: Initial Flight Booking

**Primary Actor:** Student or Instructor

**Flow:**
1. User logs into the application
2. User navigates to "Schedule Flight" interface
3. User enters booking details:
   - Student information (name, training level)
   - Date and time
   - Departure location (with map picker or address input)
   - Landing location (if cross-country)
   - Flight type/lesson focus
4. System validates:
   - Instructor availability
   - Aircraft availability
   - Initial weather check (advisory only)
5. System displays confirmation with booking ID
6. Booking is saved to database with status: "SCHEDULED"
7. User receives confirmation email/notification

**Connected Features:**
- Dashboard (displays new booking)
- Weather monitoring system (begins tracking)
- Database (stores booking record)

**UI Elements Needed:**
- Booking form with location picker
- Calendar/date-time selector
- Training level dropdown
- Confirmation modal
- Email notification template

---

### Journey 2: Automated Weather Monitoring (Background Process)

**Primary Actor:** System (Automated)

**Flow:**
1. Background scheduler runs hourly
2. System queries database for all flights scheduled within next 24-48 hours
3. For each booking:
   - Retrieves student training level
   - Determines applicable weather minimums
   - Fetches weather data for:
     - Departure location
     - Landing location (if applicable)
     - Flight corridor (if cross-country)
4. System evaluates weather against minimums
5. If conflict detected:
   - Updates booking status to "AT_RISK" or "CANCELLED"
   - Triggers notification workflow
   - Triggers AI rescheduling workflow

**Connected Features:**
- Weather API integration
- Database (reads/updates bookings)
- Notification system
- AI rescheduling engine
- Dashboard (displays alerts)

**UI Elements Needed:**
- Background service (no UI)
- System health dashboard for administrators

---

### Journey 3: Receiving Weather Conflict Notification

**Primary Actor:** Student and Instructor

**Flow:**
1. User receives notification via:
   - Email
   - In-app notification badge
   - (Optional) SMS
2. Notification contains:
   - Flight details (date, time, location)
   - Specific weather concerns (e.g., "Winds 15kt, exceeds Student Pilot minimum of 10kt")
   - Current booking status
   - Call-to-action: "View Rescheduling Options"
3. User clicks notification or logs into dashboard
4. System navigates user to affected booking details

**Connected Features:**
- Notification service
- Dashboard
- Booking detail view

**UI Elements Needed:**
- Notification center/inbox
- Email template
- SMS template (optional)
- Notification badges/indicators
- Toast/banner alerts

---

### Journey 4: Viewing AI-Generated Rescheduling Options

**Primary Actor:** Student or Instructor

**Flow:**
1. User views affected booking in dashboard
2. System displays:
   - Original booking details
   - Weather conflict explanation
   - "AI-Suggested Alternatives" section
3. AI presents 3 rescheduling options, each showing:
   - Suggested date and time
   - Weather forecast for that slot
   - Reason for suggestion (e.g., "Similar time slot, clear conditions expected")
   - Instructor and aircraft availability
4. User can:
   - **Option A:** Select one of the AI suggestions
   - **Option B:** Request more options
   - **Option C:** Manually reschedule (opens booking form)
   - **Option D:** Cancel without rescheduling

**Connected Features:**
- AI reasoning engine
- Weather API (for forecasts)
- Availability checker
- Booking update system

**UI Elements Needed:**
- Booking detail page
- Weather conflict alert card
- Rescheduling options cards (3 suggestions)
- Action buttons (Select, More Options, Manual, Cancel)
- Weather forecast visualization
- Availability indicators

---

### Journey 5: Confirming a Reschedule

**Primary Actor:** Student and Instructor (requires both confirmations)

**Flow:**
1. Student selects a rescheduling option
2. System marks student as "CONFIRMED"
3. System sends notification to instructor
4. Instructor reviews and either:
   - Confirms (reschedule finalized)
   - Declines (back to step 1 for student)
5. Upon both confirmations:
   - Original booking status → "RESCHEDULED"
   - New booking created with status → "SCHEDULED"
   - Both users receive confirmation notification
   - Database logs the reschedule event
6. Dashboard updates to reflect new schedule

**Connected Features:**
- Notification system (bidirectional)
- Database (updates and creates records)
- Dashboard (reflects changes)
- Audit log (tracks reschedule chain)

**UI Elements Needed:**
- Confirmation buttons
- Pending approval status indicator
- Approval notification (for instructor)
- Success confirmation modal
- Timeline/history view of reschedules

---

### Journey 6: Monitoring Active Flights & Alerts (Dashboard)

**Primary Actor:** All Users

**Flow:**
1. User logs into application
2. Dashboard displays:
   - **Upcoming Flights Panel:**
     - Next 7 days of scheduled flights
     - Status indicators (Scheduled, At Risk, Confirmed, Completed)
   - **Active Weather Alerts Panel:**
     - Current conflicts requiring attention
     - Count of flights affected
   - **Recent Activity Panel:**
     - Latest bookings, cancellations, reschedules
   - **Training Progress Panel** (for students):
     - Flight hours logged
     - Training milestones
3. User can filter by:
   - Date range
   - Status
   - Student (for instructors)
   - Location
4. User clicks on any flight to view details

**Connected Features:**
- Database (real-time queries)
- Weather monitoring system
- Booking detail views
- Notification center

**UI Elements Needed:**
- Dashboard layout with multiple panels
- Flight status cards/list items
- Weather alert banners
- Status badges and icons
- Filter controls
- Quick action buttons
- Real-time update indicators

---

### Journey 7: Manual Flight Cancellation

**Primary Actor:** Student or Instructor

**Flow:**
1. User navigates to booking details
2. User clicks "Cancel Flight"
3. System prompts for:
   - Cancellation reason (dropdown)
   - Optional notes
4. User confirms cancellation
5. System updates booking status to "CANCELLED"
6. System sends notification to other party (instructor or student)
7. System optionally triggers AI to suggest reschedules
8. Database logs cancellation with timestamp and reason

**Connected Features:**
- Booking management
- Notification system
- AI rescheduling (optional trigger)
- Database audit log

**UI Elements Needed:**
- Cancel button (with warning color)
- Cancellation reason modal
- Confirmation dialog
- Cancellation confirmation page

---

### Journey 8: Viewing Analytics & Metrics (Administrator)

**Primary Actor:** Administrator

**Flow:**
1. Administrator navigates to Analytics dashboard
2. System displays key metrics:
   - Total bookings created (this period)
   - Weather conflicts detected
   - Successful reschedules
   - Average rescheduling time
   - Cancellation reasons breakdown
3. Visualizations include:
   - Time-series charts (bookings over time)
   - Weather conflict frequency by location
   - Rescheduling success rate
   - Peak booking times
4. Administrator can:
   - Export data (CSV/PDF)
   - Set date range filters
   - Drill down into specific metrics

**Connected Features:**
- Database (aggregated queries)
- Export service
- Reporting engine

**UI Elements Needed:**
- Analytics dashboard layout
- Charts and graphs (line, bar, pie)
- Metric cards with statistics
- Date range picker
- Export buttons
- Filter controls

---

## User Journey Map (Flow Diagram)

```
┌─────────────────┐
│  User Login     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              Main Dashboard                         │
│  • Upcoming Flights                                 │
│  • Weather Alerts                                   │
│  • Recent Activity                                  │
└──┬────────────────────────┬─────────────────────┬──┘
   │                        │                     │
   ▼                        ▼                     ▼
┌────────────┐    ┌──────────────────┐    ┌─────────────┐
│ Create     │    │ View Booking     │    │ Analytics   │
│ Booking    │    │ Details          │    │ (Admin)     │
└─────┬──────┘    └────────┬─────────┘    └─────────────┘
      │                    │
      │                    ▼
      │           ┌─────────────────┐
      │           │ Weather Conflict?├─── No ──→ Continue Monitoring
      │           └────────┬─────────┘
      │                    │ Yes
      │                    ▼
      │           ┌─────────────────────┐
      │           │ Receive Notification │
      │           └──────────┬──────────┘
      │                      │
      └──────────────────────┼────────────────────┐
                             │                    │
                             ▼                    ▼
                    ┌──────────────────┐   ┌──────────────┐
                    │ View AI          │   │ Manual       │
                    │ Reschedule       │   │ Cancel       │
                    │ Options          │   └──────────────┘
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Select Option    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────────┐
                    │ Instructor Approval  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Reschedule Confirmed │
                    │ (Back to Dashboard)  │
                    └──────────────────────┘
```

---

## State Transitions

### Booking Status Flow
```
SCHEDULED → AT_RISK → CANCELLED → RESCHEDULED
    ↓           ↓           ↓
COMPLETED   SCHEDULED   [New Booking: SCHEDULED]
```

### Notification States
```
SENT → DELIVERED → READ → ACTION_TAKEN
```

### Rescheduling States
```
CONFLICT_DETECTED → AI_OPTIONS_GENERATED → STUDENT_SELECTED → 
PENDING_INSTRUCTOR → CONFIRMED → NEW_BOOKING_CREATED
```

---

## Key Interaction Points

### 1. **Dashboard ↔ Booking Details**
- Primary navigation path
- Real-time status updates
- Quick actions available

### 2. **Weather API ↔ AI Engine**
- Weather data feeds AI decision-making
- AI considers training level + weather minimums
- Generates contextual rescheduling suggestions

### 3. **Notification System ↔ All Features**
- Central hub for user communications
- Triggers from multiple sources (weather, approvals, cancellations)
- Multi-channel delivery (email, in-app, SMS)

### 4. **Database ↔ Everything**
- Single source of truth
- Audit trail for all actions
- Powers analytics and reporting

---

## Design Considerations for UI/UX

### Responsiveness
- Dashboard must work on mobile (instructors on-the-go)
- Touch-friendly buttons for mobile approval/rejection
- Offline capability for viewing scheduled flights

### Real-Time Updates
- WebSocket or polling for live dashboard updates
- Push notifications for critical weather alerts
- Visual indicators when data is refreshing

### Accessibility
- Clear status indicators (color + icon + text)
- High contrast for weather warnings
- Keyboard navigation support
- Screen reader friendly

### Progressive Disclosure
- Show summary information first
- Drill down for detailed weather data
- Collapsible sections for complex forms

### Error Handling
- Graceful degradation if weather API fails
- Clear error messages with recovery actions
- Retry mechanisms for failed notifications

---

## Navigation Structure

```
├── Dashboard (Home)
│   ├── Upcoming Flights
│   ├── Active Alerts
│   └── Recent Activity
│
├── Schedule Flight
│   ├── New Booking Form
│   └── Booking Confirmation
│
├── My Flights
│   ├── All Bookings (List/Calendar View)
│   ├── Booking Details
│   │   ├── Weather Information
│   │   ├── Reschedule Options
│   │   └── Cancel/Modify
│   └── Flight History
│
├── Notifications
│   ├── Inbox
│   ├── Notification Settings
│   └── Archive
│
├── Profile
│   ├── Personal Information
│   ├── Training Level
│   └── Contact Preferences
│
└── Analytics (Admin Only)
    ├── Overview
    ├── Weather Conflicts
    ├── Rescheduling Metrics
    └── Reports
```

---

## Next Steps for Architecture

Based on these user flows, the following architectural components should be designed:

1. **Frontend Components**
   - Dashboard layout and panels
   - Booking form with validation
   - Flight status cards
   - Notification center
   - Rescheduling options display
   - Weather visualization widgets

2. **Backend Services**
   - Weather monitoring scheduler
   - AI rescheduling engine
   - Notification service (email, SMS, push)
   - Booking management API
   - Analytics aggregation service

3. **Database Schema**
   - Students table (with trainingLevel)
   - Bookings table (with status tracking)
   - Weather logs table
   - Reschedule history table
   - Notifications table
   - Audit log table

4. **External Integrations**
   - Weather API (OpenWeatherMap/WeatherAPI.com)
   - Email service (SendGrid/AWS SES)
   - SMS service (Twilio - optional)
   - AI SDK (Vercel AI SDK/LangGraph)

5. **Background Jobs**
   - Hourly weather check scheduler
   - Notification queue processor
   - Database cleanup/archival
   - Analytics aggregation

---

## Success Metrics Mapped to User Flows

| Metric | Related User Journey | Measurement Point |
|--------|---------------------|-------------------|
| Bookings Created | Journey 1 | Form submission confirmation |
| Weather Conflicts Detected | Journey 2 | System flags booking as AT_RISK |
| Successful Reschedules | Journey 5 | Both parties confirm new time |
| Average Rescheduling Time | Journeys 3-5 | Time from notification to confirmation |
| Notification Delivery Rate | Journey 3 | Email/SMS delivery confirmation |
| AI Suggestion Acceptance Rate | Journey 4 | User selects AI option vs manual |

---

## Conclusion

This user flow document provides a comprehensive map of how users interact with the Weather Cancellation & AI Rescheduling system. Each journey has been designed to minimize friction while ensuring safety and effective communication. The connected features and required UI elements outlined here will serve as the foundation for building a robust, user-friendly application that meets all project objectives.

