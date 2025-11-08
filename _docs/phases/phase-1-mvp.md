# Phase 1: MVP - Core Features

## Overview
This phase implements the core functionality that delivers the project's primary value: automated weather monitoring, conflict detection, AI-powered rescheduling, and notifications. By the end of this phase, you'll have a minimal viable product that can book flights, detect weather conflicts, and suggest reschedule options.

**Timeline:** Days 2-3 (12-16 hours)  
**Status:** Minimal Viable Product  
**Deliverable:** A functional weather cancellation and AI rescheduling system

---

## Success Criteria

By the end of this phase, you should be able to:
- ✅ Create flight bookings with location and training level
- ✅ See flight bookings in dashboard
- ✅ Weather data is fetched for flight locations
- ✅ System detects conflicts based on training level minimums
- ✅ AI generates 3 rescheduling options
- ✅ Email notifications are sent for weather conflicts
- ✅ Dashboard displays weather alerts

---

## Features & Tasks

### Feature 1: Flight Booking Data Model

**Goal:** Create comprehensive database schema for flight scheduling

**Steps:**
1. Update Prisma schema with booking-related models
   - `Booking` model (id, studentId, instructorId, scheduledDate, departureLocation, destinationLocation, status, duration, notes)
   - `Location` embedded type (name, latitude, longitude, icaoCode)
   - `WeatherLog` model (bookingId, weatherData, checkedAt, conflict)
   - `Reschedule` model (bookingId, originalDate, newDate, reason, status)

2. Add enum types to schema
   - `FlightStatus`: SCHEDULED, AT_RISK, CANCELLED, RESCHEDULED, COMPLETED
   - `TrainingLevel`: STUDENT, PRIVATE, INSTRUMENT, COMMERCIAL
   - `UserRole`: STUDENT, INSTRUCTOR, ADMIN

3. Create and run migration
   ```bash
   pnpm prisma migrate dev --name add-booking-models
   ```

4. Update seed script with sample bookings
   - Add 5-10 sample bookings with different statuses
   - Include flights scheduled in next 48 hours
   - Mix of student and instrument-rated flights

5. Generate TypeScript types and verify
   ```bash
   pnpm prisma generate
   ```
   - Create `src/types/flight.ts` with extended types
   - Export type utilities and helpers

**Validation:**
- Prisma Studio shows all new tables
- Sample bookings are visible in database
- TypeScript imports work: `import type { Booking } from '@prisma/client'`

---

### Feature 2: Flight Booking Service

**Goal:** Implement business logic for flight CRUD operations

**Steps:**
1. Create flight service class
   - Create `src/services/flight-service.ts`
   - Implement `listFlights()`, `getFlightById()`, `createFlight()`, `updateFlight()`, `cancelFlight()`
   - Add JSDoc documentation for all methods

2. Implement booking validation logic
   - Create `src/services/validation/booking-validation.ts`
   - Validate date is in future
   - Check instructor availability (no double-booking)
   - Validate location coordinates

3. Add weather minimums constants
   - Create `src/constants/weather-minimums.ts`
   - Define minimums for each training level (from project requirements)
   - Export type-safe constants

4. Implement status transition logic
   - Only allow valid status transitions
   - Log all status changes to audit trail
   - Trigger notifications on status changes

5. Add error handling
   - Create custom error types in `src/types/errors.ts`
   - Handle not found, unauthorized, validation errors
   - Return user-friendly error messages

**Validation:**
- Can create booking with valid data
- Validation errors are thrown for invalid data
- Service methods are properly typed
- Error messages are clear and actionable

---

### Feature 3: Flight Booking tRPC Router

**Goal:** Create type-safe API endpoints for flight operations

**Steps:**
1. Create Zod validation schemas
   - Create `src/server/schemas/flight-schemas.ts`
   - Define `createFlightSchema`, `updateFlightSchema`, `flightListOptionsSchema`
   - Include location validation (lat/lon ranges)

2. Create flights router
   - Create `src/server/routers/flights.ts`
   - Implement `list`, `getById`, `create`, `update`, `cancel` procedures
   - Add authentication middleware (require logged-in user)

3. Add role-based authorization
   - Students can only view/create their own bookings
   - Instructors can view their assigned flights
   - Admins can view all flights

4. Merge router into root router
   - Update `src/server/routers/index.ts`
   - Export `flightsRouter` as part of `appRouter`

5. Create tRPC hooks for client
   - Create `src/hooks/use-flights.ts`
   - Export `useFlights()`, `useFlight(id)`, `useCreateFlight()`, etc.
   - Configure React Query options (staleTime, refetchInterval)

**Validation:**
- API calls work from client components
- TypeScript autocomplete shows all fields
- Authorization prevents unauthorized access
- Validation errors return clear messages

---

### Feature 4: Flight Booking UI

**Goal:** Create user interface for booking flights

**Steps:**
1. Create flight booking form component
   - Create `src/components/flights/flight-form.tsx`
   - Fields: student, instructor, date/time, departure location, destination (optional), duration, notes
   - Use shadcn/ui form components
   - Add date/time picker component

2. Implement location search/input
   - Create `src/components/flights/location-input.tsx`
   - Allow manual lat/lon entry or location name
   - Store as JSON in database
   - Validate coordinates are valid

3. Create flight list view
   - Create `src/components/flights/flight-list.tsx`
   - Display as cards with key info (date, status, locations)
   - Color-code by status (green=scheduled, yellow=at-risk, red=cancelled)
   - Add filtering by status and date range

4. Create flight detail page
   - Create `src/app/(dashboard)/flights/[id]/page.tsx`
   - Show all booking details
   - Display weather information (placeholder for now)
   - Include edit and cancel buttons

5. Build new booking page
   - Create `src/app/(dashboard)/flights/new/page.tsx`
   - Embed flight booking form
   - Handle form submission with tRPC mutation
   - Redirect to flight detail on success

**Validation:**
- Can create new flight through UI
- Flights appear in list immediately
- Can view flight details
- Form validation shows errors
- Success/error toasts display correctly

---

### Feature 5: Weather API Integration

**Goal:** Integrate OpenWeatherMap API for weather data

**Steps:**
1. Create weather API client
   - Create `src/lib/weather.ts`
   - Implement `getCurrentWeather(lat, lon)` and `getForecast(lat, lon, hours)`
   - Add retry logic and timeout handling
   - Transform API response to internal format

2. Define weather data types
   - Create `src/types/weather.ts`
   - Define `WeatherData`, `WeatherForecast`, `WeatherCondition` types
   - Include all relevant fields (temp, wind, visibility, ceiling, conditions)

3. Create weather data caching
   - Cache weather responses for 30 minutes
   - Store in-memory or use React Query cache
   - Avoid redundant API calls for same location

4. Add environment configuration
   - Add `OPENWEATHER_API_KEY` to `.env.example`
   - Update `src/lib/env.ts` to validate weather API key
   - Add API key to actual `.env.local`

5. Test weather API integration
   - Create test procedure in tRPC: `weather.getCurrent`
   - Call with sample coordinates
   - Verify response data format
   - Handle API errors gracefully

**Validation:**
- Weather API returns valid data
- Response is transformed correctly
- Caching reduces redundant calls
- Errors are handled without crashing

---

### Feature 6: Weather Conflict Detection

**Goal:** Implement logic to detect unsafe flying conditions

**Steps:**
1. Create weather evaluation service
   - Create `src/services/weather-service.ts`
   - Implement `checkFlightWeather(bookingId)` method
   - Fetch weather for departure and destination
   - Compare against training level minimums

2. Implement conflict detection logic
   - Create `src/services/validation/weather-validation.ts`
   - Function: `evaluateWeatherSafety(weather, trainingLevel)`
   - Check visibility, ceiling, wind speed, crosswind
   - Return conflict details if unsafe

3. Update booking status based on weather
   - If conflict detected, update status to AT_RISK
   - If resolved, update back to SCHEDULED
   - Log weather check to WeatherLog table
   - Store conflict reason (e.g., "Wind 15kt exceeds Student Pilot max of 10kt")

4. Create weather tRPC router
   - Create `src/server/routers/weather.ts`
   - Procedure: `checkFlight` (manually trigger check)
   - Procedure: `getWeatherHistory` (view past checks)

5. Add weather display to flight details
   - Create `src/components/weather/weather-widget.tsx`
   - Show current weather for flight location
   - Display conflict warning if present
   - Include weather forecast for flight time

**Validation:**
- Weather checks detect conflicts correctly
- Student pilot flights flagged in high winds
- Instrument-rated flights allowed in IMC
- Booking status updates appropriately
- Weather widget displays accurate data

---

### Feature 7: AI Rescheduling Service

**Goal:** Use OpenAI to generate intelligent rescheduling options

**Steps:**
1. Install and configure Vercel AI SDK
   ```bash
   pnpm add ai openai
   ```
   - Add `OPENAI_API_KEY` to environment variables
   - Create `src/lib/ai.ts` with OpenAI client setup

2. Create AI rescheduling service
   - Create `src/services/ai-reschedule-service.ts`
   - Implement `generateRescheduleOptions(bookingId)` method
   - Build prompt with flight details, weather forecast, and requirements

3. Design AI prompt structure
   - Include: original booking details, student training level, weather minimums
   - Request: 3 alternative date/time slots in next 7 days
   - For each option: date/time, expected weather, reasoning
   - Use JSON mode for structured output

4. Parse and validate AI response
   - Define Zod schema for AI output
   - Validate each suggested option has valid date/time
   - Check instructor availability for suggested times
   - Filter out invalid suggestions

5. Create reschedule tRPC router
   - Create `src/server/routers/reschedule.ts`
   - Procedure: `generateOptions(bookingId)`
   - Procedure: `acceptOption(bookingId, newDate)`
   - Store reschedule history in database

**Validation:**
- AI generates 3 valid reschedule options
- Options consider weather forecast
- Options respect training level requirements
- Response is properly structured (JSON)
- Invalid dates are filtered out

---

### Feature 8: Email Notification System

**Goal:** Send email notifications for weather conflicts and reschedules

**Steps:**
1. Install Resend and React Email
   ```bash
   pnpm add resend react-email @react-email/components
   ```
   - Add `RESEND_API_KEY` to environment variables
   - Create `src/lib/email.ts` with Resend client

2. Create email templates
   - Create `emails/weather-conflict.tsx`
   - Include: flight details, conflict reason, link to view reschedule options
   - Style with Tailwind classes (inline for email)
   - Add plain text version

3. Create notification service
   - Create `src/services/notification-service.ts`
   - Method: `sendWeatherConflictEmail(booking, conflict)`
   - Method: `sendBookingConfirmation(booking)`
   - Method: `sendRescheduleConfirmation(oldBooking, newBooking)`

4. Add notification tracking
   - Create `Notification` model in Prisma
   - Store: type, recipient, status (SENT, DELIVERED, FAILED)
   - Log all sent notifications for audit

5. Integrate notifications with workflow
   - Send confirmation email on booking creation
   - Send alert email when conflict detected
   - Send reschedule confirmation when option accepted
   - Handle email send failures gracefully

**Validation:**
- Emails are sent successfully
- Email templates render correctly
- Links in emails work
- Notifications are logged in database
- Failed sends are retried or logged

---

### Feature 9: Dashboard Flight Display

**Goal:** Display flights and alerts on main dashboard

**Steps:**
1. Create dashboard stat cards
   - Create `src/components/dashboard/stat-card.tsx`
   - Show: Total flights, At-risk flights, Completed flights
   - Calculate from database queries
   - Add loading skeletons

2. Create upcoming flights section
   - Create `src/components/dashboard/upcoming-flights.tsx`
   - Display next 5 flights in chronological order
   - Show status badge and basic info
   - Link to flight detail page

3. Create weather alerts section
   - Create `src/components/dashboard/weather-alerts.tsx`
   - List all AT_RISK flights
   - Show conflict reason
   - Link to view reschedule options
   - Highlight urgency (flights within 24 hours)

4. Update dashboard home page
   - Update `src/app/(dashboard)/page.tsx`
   - Arrange sections in grid layout
   - Add quick action buttons (Create Flight)
   - Show personalized welcome based on role

5. Add real-time updates
   - Configure React Query to refetch every 30 seconds
   - Show last updated timestamp
   - Add manual refresh button

**Validation:**
- Dashboard shows accurate flight counts
- Upcoming flights are in chronological order
- Weather alerts display AT_RISK flights only
- Stats update when data changes
- Auto-refresh works correctly

---

### Feature 10: Reschedule Options UI

**Goal:** Display AI-generated reschedule options and allow selection

**Steps:**
1. Create reschedule options component
   - Create `src/components/reschedule/reschedule-options.tsx`
   - Display 3 AI-generated options as cards
   - Show: date/time, weather forecast, AI reasoning
   - Add "Select" button for each option

2. Create reschedule option card
   - Create `src/components/reschedule/reschedule-card.tsx`
   - Show weather details (temperature, wind, visibility)
   - Include weather icon based on conditions
   - Highlight if option is within 24 hours

3. Add reschedule section to flight detail
   - Update `src/app/(dashboard)/flights/[id]/page.tsx`
   - Show "Generate Reschedule Options" button for AT_RISK flights
   - Display options when generated
   - Show loading state during AI generation

4. Implement option selection flow
   - Click "Select" opens confirmation dialog
   - Show comparison: old date vs new date
   - Confirm button triggers reschedule mutation
   - Update booking to new date/time

5. Handle reschedule success
   - Show success toast notification
   - Update booking status to RESCHEDULED
   - Create new booking with SCHEDULED status
   - Send confirmation email to student and instructor

**Validation:**
- AI options display correctly
- Can select an option and confirm
- New booking is created with correct date
- Original booking marked as RESCHEDULED
- Success notification appears
- Confirmation email is sent

---

## Phase 1 Checklist

Before moving to Phase 2, verify:

- [ ] Can create flight bookings through UI
- [ ] Flights display in dashboard and list view
- [ ] Weather API fetches current and forecast data
- [ ] System detects conflicts based on training level
- [ ] Conflicts update booking status to AT_RISK
- [ ] Dashboard shows weather alerts for AT_RISK flights
- [ ] AI generates 3 reschedule options when requested
- [ ] Can select and confirm a reschedule option
- [ ] New booking is created, old marked as RESCHEDULED
- [ ] Email notifications sent for conflicts and confirmations
- [ ] All tRPC procedures are properly typed
- [ ] Error handling works throughout the flow
- [ ] Code follows `project-rules.md` (max 500 lines per file)

---

## Deliverables

1. **Working Flight Booking System**
   - Create, view, edit, cancel flights
   - Filter and search functionality
   - Role-based access control

2. **Weather Monitoring**
   - Automatic weather checks
   - Conflict detection logic
   - Training level minimums enforcement

3. **AI Rescheduling**
   - OpenAI integration
   - 3 intelligent reschedule options
   - Option selection and confirmation

4. **Notification System**
   - Email templates (React Email)
   - Automated notifications
   - Notification tracking

5. **Dashboard**
   - Flight statistics
   - Upcoming flights display
   - Weather alerts section

---

## Testing Strategy

### Manual Testing
1. **Happy Path:** Create flight → detect conflict → generate options → accept option → verify new booking
2. **Student Pilot:** Test stricter weather minimums (visibility, wind limits)
3. **Instrument Rated:** Test IMC conditions are allowed
4. **Edge Cases:** Past dates, invalid locations, unavailable instructors

### Integration Testing
- Weather API returns valid data
- AI generates valid options
- Emails are sent successfully
- Database updates correctly

---

## Common Issues & Solutions

### Issue: AI Generates Invalid Dates
**Solution:** 
- Strengthen prompt with explicit date format requirements
- Add post-processing validation with Zod
- Filter out past dates and dates beyond 7 days

### Issue: Weather API Rate Limit
**Solution:**
- Implement caching (30-minute cache)
- Add retry logic with exponential backoff
- Consider upgrading API tier if needed

### Issue: Email Delivery Failures
**Solution:**
- Verify `RESEND_API_KEY` is correct
- Check "From" email domain is verified
- Log failures and implement retry queue

### Issue: Booking Status Not Updating
**Solution:**
- Check weather check service is running
- Verify conflict detection logic
- Add logging to track status transitions

---

## Next Steps

Once Phase 1 (MVP) is complete, proceed to **Phase 2: Enhancement** which will add:
- Reschedule approval workflow (instructor must approve)
- Admin analytics dashboard
- Advanced filtering and search
- Improved error handling and validation
- UI/UX polish and responsive design

**Estimated Time for Phase 2:** Day 4 (8-10 hours)

---

## Performance Considerations

- **Weather Caching:** Cache weather data for 30 minutes to reduce API calls
- **Database Queries:** Add indexes on `scheduledDate`, `status`, `userId` fields
- **AI Calls:** Consider caching AI responses for similar scenarios
- **React Query:** Configure appropriate `staleTime` and `gcTime`
- **Email Queue:** Consider background job queue for email sending (future)

---

**Phase 1 Complete!** 🎉

You now have a functional MVP that delivers the core value proposition: automated weather monitoring, conflict detection, and AI-powered rescheduling. The system can book flights, monitor weather, detect conflicts, and suggest alternatives—all working together in a cohesive product.

**Key Achievement:** You've built a system that solves a real problem (weather cancellations) with AI-powered automation!

