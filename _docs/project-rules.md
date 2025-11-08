# SkyShift Project Rules & Conventions

## Overview
This document establishes the core rules, conventions, and standards for the SkyShift project. These guidelines ensure a **modular, scalable, and AI-first codebase** that is easy to understand, navigate, and maintain. All team members and AI tools must follow these rules consistently.

**Last Updated:** November 8, 2025

---

## Table of Contents
1. [AI-First Development Principles](#ai-first-development-principles)
2. [Project Structure](#project-structure)
3. [File Organization Rules](#file-organization-rules)
4. [Naming Conventions](#naming-conventions)
5. [Documentation Standards](#documentation-standards)
6. [Code Organization](#code-organization)
7. [TypeScript Guidelines](#typescript-guidelines)
8. [Component Architecture](#component-architecture)
9. [Testing Standards](#testing-standards)
10. [Git Workflow](#git-workflow)

---

# AI-First Development Principles

## Core Principles

### 1. Maximum File Size: 500 Lines
**Rule:** No file shall exceed 500 lines of code (excluding comments and blank lines).

**Rationale:**
- Optimizes AI context window usage
- Improves code comprehension for both humans and AI
- Forces proper separation of concerns
- Easier to test and maintain

**Enforcement:**
```bash
# Check file sizes during development
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -20
```

**When Approaching Limit:**
- Split into logical sub-modules
- Extract utilities to separate files
- Move types to dedicated type files
- Separate business logic from UI logic

### 2. Modular Architecture
**Rule:** Every file should have a single, clear responsibility.

**Examples:**
- ✅ Good: `flight-booking-form.tsx` (one component)
- ✅ Good: `weather-validation.ts` (one concern)
- ❌ Bad: `utils.ts` (too generic, multiple concerns)
- ❌ Bad: `dashboard-components.tsx` (multiple components)

### 3. Clear Dependencies
**Rule:** Dependencies should flow in one direction (no circular dependencies).

**Dependency Layers (Top to Bottom):**
```
app/          → UI layer (pages, layouts)
components/   → Reusable UI components
services/     → Business logic
lib/          → Utilities, clients, helpers
types/        → Type definitions
```

**Enforcement:**
- Lower layers never import from higher layers
- Use dependency injection for cross-layer communication
- Use events/callbacks to break circular dependencies

### 4. Self-Documenting Code
**Rule:** Code should be readable without excessive comments.

**Principles:**
- Descriptive variable and function names
- Small, focused functions
- Clear control flow
- Comments explain "why," not "what"

---

# Project Structure

## Root Directory Structure

```
skyshift/
├── _docs/                     # Project documentation
│   ├── project-overview.md    # Project requirements
│   ├── user-flow.md           # User journey documentation
│   ├── tech-stack.md          # Technology decisions
│   └── project-rules.md       # This file
│
├── prisma/                    # Database layer
│   ├── schema.prisma          # Database schema (max 500 lines)
│   ├── seed.ts                # Seed data script
│   └── migrations/            # Migration history
│
├── src/
│   ├── app/                   # Next.js App Router (UI layer)
│   ├── components/            # Reusable React components
│   ├── server/                # Server-side logic (tRPC routers)
│   ├── services/              # Business logic (domain services)
│   ├── lib/                   # Utilities and third-party clients
│   ├── stores/                # Client state management (Zustand)
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Pure utility functions
│   └── constants/             # Application constants
│
├── lambda/                    # AWS Lambda functions
│   └── weather-check/         # Hourly weather monitoring job
│
├── emails/                    # React Email templates
│   ├── weather-conflict.tsx   # Weather alert email
│   └── reschedule-confirmed.tsx
│
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests (optional)
│
├── public/                    # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── .env.local                 # Local environment variables
├── .env.example               # Environment variable template
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
└── README.md                  # Project setup and usage
```

---

## Detailed Directory Guidelines

### `/src/app` - Next.js App Router (UI Layer)

**Purpose:** Contains all routes, pages, layouts, and route-specific logic.

**Structure:**
```
src/app/
├── (auth)/                    # Route group: Authentication pages
│   ├── login/
│   │   └── page.tsx           # Login page
│   └── signup/
│       └── page.tsx           # Signup page
│
├── (dashboard)/               # Route group: Protected dashboard routes
│   ├── layout.tsx             # Dashboard layout (nav, header)
│   ├── page.tsx               # Dashboard home page
│   │
│   ├── flights/               # Flight management routes
│   │   ├── page.tsx           # Flight list page
│   │   ├── [id]/              # Dynamic route for flight details
│   │   │   ├── page.tsx       # Flight detail page
│   │   │   └── edit/
│   │   │       └── page.tsx   # Edit flight page
│   │   └── new/
│   │       └── page.tsx       # Create flight page
│   │
│   ├── analytics/             # Admin analytics routes
│   │   ├── page.tsx           # Analytics dashboard
│   │   └── reports/
│   │       └── page.tsx       # Reports page
│   │
│   └── profile/               # User profile routes
│       └── page.tsx           # Profile page
│
├── api/                       # API routes
│   ├── auth/                  # NextAuth.js routes
│   │   └── [...nextauth]/
│   │       └── route.ts       # NextAuth handler
│   └── trpc/                  # tRPC API handler
│       └── [trpc]/
│           └── route.ts       # tRPC router handler
│
├── layout.tsx                 # Root layout (global styles, providers)
├── globals.css                # Global CSS styles
├── loading.tsx                # Global loading state
└── error.tsx                  # Global error boundary
```

**Rules:**
- ✅ Use route groups `(name)` for organization without affecting URLs
- ✅ Use `loading.tsx` and `error.tsx` at appropriate levels
- ✅ Co-locate route-specific components in the same directory
- ✅ Keep page components under 300 lines (extract components if larger)
- ❌ Don't put business logic in page files (use services)
- ❌ Don't create shared components here (use `/src/components`)

---

### `/src/components` - Reusable React Components

**Purpose:** Houses all reusable React components used across the application.

**Structure:**
```
src/components/
├── ui/                        # shadcn/ui base components
│   ├── button.tsx             # Button component
│   ├── dialog.tsx             # Dialog/modal component
│   ├── input.tsx              # Input field component
│   ├── select.tsx             # Select dropdown component
│   └── toast.tsx              # Toast notification component
│
├── dashboard/                 # Dashboard-specific components
│   ├── dashboard-header.tsx   # Dashboard header
│   ├── dashboard-nav.tsx      # Dashboard navigation
│   ├── stat-card.tsx          # Statistics card
│   └── weather-alert-banner.tsx
│
├── flights/                   # Flight-related components
│   ├── flight-card.tsx        # Flight card display
│   ├── flight-list.tsx        # Flight list container
│   ├── flight-form.tsx        # Flight booking form
│   ├── flight-status-badge.tsx
│   └── flight-filters.tsx     # Filter controls
│
├── weather/                   # Weather-related components
│   ├── weather-widget.tsx     # Weather display widget
│   ├── weather-icon.tsx       # Weather condition icon
│   └── weather-forecast.tsx   # Forecast display
│
├── reschedule/                # Rescheduling components
│   ├── reschedule-options.tsx # AI-generated options display
│   ├── reschedule-card.tsx    # Single option card
│   └── approval-dialog.tsx    # Instructor approval dialog
│
├── notifications/             # Notification components
│   ├── notification-list.tsx  # Notification inbox
│   ├── notification-item.tsx  # Single notification
│   └── notification-badge.tsx # Unread count badge
│
└── common/                    # Common shared components
    ├── loading-spinner.tsx    # Loading indicator
    ├── empty-state.tsx        # Empty state placeholder
    ├── error-message.tsx      # Error display
    └── page-header.tsx        # Page header component
```

**Component File Template:**
```tsx
/**
 * @fileoverview Flight card component displaying flight booking summary
 * @module components/flights/flight-card
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import type { Flight } from '@/types/flight';

/**
 * Props for the FlightCard component
 */
interface FlightCardProps {
  /** Flight data to display */
  flight: Flight;
  /** Callback when card is clicked */
  onClick?: (flightId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Displays a flight booking in a card format with key details
 * 
 * @param props - Component props
 * @returns Rendered flight card
 * 
 * @example
 * ```tsx
 * <FlightCard 
 *   flight={flightData} 
 *   onClick={(id) => router.push(`/flights/${id}`)}
 * />
 * ```
 */
export function FlightCard({ flight, onClick, className }: FlightCardProps) {
  // Component implementation
  return (
    <Card className={className}>
      {/* Card content */}
    </Card>
  );
}
```

**Rules:**
- ✅ One component per file
- ✅ Named exports (not default) for components
- ✅ Group related components in subdirectories
- ✅ Include TypeScript interfaces for all props
- ✅ Document component purpose and props
- ✅ Keep components under 200 lines (extract sub-components)
- ❌ No business logic in components (use hooks/services)
- ❌ No direct API calls (use tRPC hooks)

---

### `/src/server` - Server-Side Logic (tRPC)

**Purpose:** Contains tRPC routers, procedures, middleware, and server-only logic.

**Structure:**
```
src/server/
├── context.ts                 # tRPC context creation
├── trpc.ts                    # tRPC initialization and middleware
│
├── routers/                   # tRPC routers (one per domain)
│   ├── index.ts               # Root router (merges all routers)
│   ├── flights.ts             # Flight-related procedures
│   ├── weather.ts             # Weather-related procedures
│   ├── reschedule.ts          # Rescheduling procedures
│   ├── notifications.ts       # Notification procedures
│   ├── users.ts               # User management procedures
│   └── analytics.ts           # Analytics procedures
│
├── middleware/                # tRPC middleware
│   ├── auth.ts                # Authentication middleware
│   ├── rate-limit.ts          # Rate limiting middleware
│   └── logging.ts             # Request logging middleware
│
└── schemas/                   # Zod validation schemas
    ├── flight-schemas.ts      # Flight input schemas
    ├── weather-schemas.ts     # Weather input schemas
    └── user-schemas.ts        # User input schemas
```

**Router File Template:**
```typescript
/**
 * @fileoverview tRPC router for flight booking operations
 * @module server/routers/flights
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { flightService } from '@/services/flight-service';
import { createFlightSchema, updateFlightSchema } from '../schemas/flight-schemas';

/**
 * Flight management router
 * Handles all flight booking CRUD operations
 */
export const flightsRouter = router({
  /**
   * List all flights for the authenticated user
   * 
   * @returns Array of flight bookings
   */
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['SCHEDULED', 'AT_RISK', 'CANCELLED', 'COMPLETED']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      return flightService.listFlights(ctx.session.user.id, input);
    }),

  /**
   * Get a single flight by ID
   * 
   * @throws TRPCError if flight not found or unauthorized
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      return flightService.getFlightById(input.id, ctx.session.user.id);
    }),

  /**
   * Create a new flight booking
   * 
   * @returns Created flight with generated ID
   */
  create: protectedProcedure
    .input(createFlightSchema)
    .mutation(async ({ ctx, input }) => {
      return flightService.createFlight(ctx.session.user.id, input);
    }),

  // Additional procedures...
});
```

**Rules:**
- ✅ One router per domain/feature
- ✅ Use descriptive procedure names (verbs for mutations, nouns for queries)
- ✅ Validate all inputs with Zod schemas
- ✅ Document each procedure with JSDoc
- ✅ Keep routers under 400 lines (split if larger)
- ✅ Use middleware for cross-cutting concerns (auth, logging)
- ❌ No direct database access (use services)
- ❌ No business logic in routers (delegate to services)

---

### `/src/services` - Business Logic Layer

**Purpose:** Contains core business logic, domain rules, and orchestration between different layers.

**Structure:**
```
src/services/
├── flight-service.ts          # Flight booking business logic
├── weather-service.ts         # Weather monitoring logic
├── weather-monitor.ts         # Background weather check logic
├── ai-reschedule-service.ts   # AI rescheduling engine
├── notification-service.ts    # Notification dispatch logic
├── user-service.ts            # User management logic
├── analytics-service.ts       # Analytics calculation logic
└── validation/                # Business validation rules
    ├── weather-validation.ts  # Weather minimums validation
    └── booking-validation.ts  # Booking rules validation
```

**Service File Template:**
```typescript
/**
 * @fileoverview Flight booking service - handles flight CRUD and business logic
 * @module services/flight-service
 */

import { db } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import type { CreateFlightInput, UpdateFlightInput } from '@/types/flight';
import { weatherService } from './weather-service';
import { notificationService } from './notification-service';

/**
 * Flight booking service
 * Manages flight creation, updates, cancellations, and status tracking
 */
class FlightService {
  /**
   * Lists all flights for a user with optional filtering
   * 
   * @param userId - User ID to filter flights
   * @param options - Filtering options (status, pagination)
   * @returns Array of flight bookings
   * 
   * @throws TRPCError if database query fails
   */
  async listFlights(
    userId: string,
    options: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const flights = await db.booking.findMany({
        where: {
          userId,
          ...(options.status && { status: options.status }),
        },
        take: options.limit || 20,
        skip: options.offset || 0,
        orderBy: { scheduledDate: 'desc' },
        include: {
          student: true,
          instructor: true,
        },
      });

      return flights;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch flights',
        cause: error,
      });
    }
  }

  /**
   * Creates a new flight booking
   * Triggers initial weather check and sends confirmation email
   * 
   * @param userId - User creating the booking
   * @param data - Flight booking data
   * @returns Created flight with generated ID
   * 
   * @throws TRPCError if validation fails or creation fails
   */
  async createFlight(userId: string, data: CreateFlightInput) {
    // Validate instructor availability
    const isAvailable = await this.checkInstructorAvailability(
      data.instructorId,
      data.scheduledDate
    );

    if (!isAvailable) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Instructor not available at requested time',
      });
    }

    // Create booking
    const flight = await db.booking.create({
      data: {
        userId,
        ...data,
        status: 'SCHEDULED',
      },
      include: {
        student: true,
        instructor: true,
      },
    });

    // Trigger initial weather check (async, don't await)
    weatherService.checkFlightWeather(flight.id).catch(console.error);

    // Send confirmation email
    await notificationService.sendBookingConfirmation(flight);

    return flight;
  }

  /**
   * Checks if instructor is available at given time
   * 
   * @private
   * @param instructorId - Instructor ID
   * @param scheduledDate - Requested date/time
   * @returns True if available, false otherwise
   */
  private async checkInstructorAvailability(
    instructorId: string,
    scheduledDate: Date
  ): Promise<boolean> {
    // Implementation...
    return true;
  }
}

// Export singleton instance
export const flightService = new FlightService();
```

**Rules:**
- ✅ One service per domain/feature
- ✅ Export singleton instances (lowercase name)
- ✅ Use class-based services for stateful logic
- ✅ Document all public methods with JSDoc
- ✅ Keep services under 500 lines (split into multiple services)
- ✅ Use dependency injection for external dependencies
- ✅ Include error handling and logging
- ❌ No direct HTTP requests (use lib clients)
- ❌ No UI logic (services are server-side only)

---

### `/src/lib` - Utility Libraries and Clients

**Purpose:** Third-party integrations, utility functions, and shared configurations.

**Structure:**
```
src/lib/
├── db.ts                      # Prisma client singleton
├── auth.ts                    # NextAuth configuration
├── ai.ts                      # Vercel AI SDK setup
├── weather.ts                 # Weather API client
├── email.ts                   # Resend email client
├── sms.ts                     # Twilio SMS client (optional)
├── s3.ts                      # AWS S3 client
└── utils.ts                   # Utility functions
```

**Client File Template:**
```typescript
/**
 * @fileoverview Weather API client for OpenWeatherMap and AviationWeather
 * @module lib/weather
 */

import axios, { AxiosInstance } from 'axios';
import type { WeatherData, WeatherForecast } from '@/types/weather';

/**
 * Weather API client configuration
 */
interface WeatherClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

/**
 * Weather API client
 * Provides methods to fetch current weather and forecasts
 */
class WeatherClient {
  private client: AxiosInstance;

  constructor(config: WeatherClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 5000,
      params: {
        appid: config.apiKey,
        units: 'imperial', // Fahrenheit, mph, miles
      },
    });
  }

  /**
   * Fetches current weather for a location
   * 
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Current weather data
   * 
   * @throws Error if API request fails
   * 
   * @example
   * ```ts
   * const weather = await weatherClient.getCurrentWeather(40.7128, -74.0060);
   * console.log(weather.temperature, weather.windSpeed);
   * ```
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await this.client.get('/weather', {
        params: { lat, lon },
      });

      return this.transformWeatherResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch weather: ${error.message}`);
    }
  }

  /**
   * Fetches weather forecast for a location
   * 
   * @param lat - Latitude
   * @param lon - Longitude
   * @param hours - Number of hours to forecast (default: 48)
   * @returns Weather forecast data
   * 
   * @throws Error if API request fails
   */
  async getForecast(
    lat: number,
    lon: number,
    hours: number = 48
  ): Promise<WeatherForecast> {
    try {
      const response = await this.client.get('/forecast', {
        params: { lat, lon, cnt: Math.ceil(hours / 3) },
      });

      return this.transformForecastResponse(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch forecast: ${error.message}`);
    }
  }

  /**
   * Transforms OpenWeatherMap API response to internal format
   * 
   * @private
   */
  private transformWeatherResponse(data: any): WeatherData {
    return {
      temperature: data.main.temp,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility / 1609.34, // meters to miles
      cloudCover: data.clouds.all,
      conditions: data.weather[0].main,
      description: data.weather[0].description,
      timestamp: new Date(data.dt * 1000),
    };
  }

  private transformForecastResponse(data: any): WeatherForecast {
    // Implementation...
    return { periods: [] };
  }
}

// Export configured client instance
export const weatherClient = new WeatherClient({
  apiKey: process.env.OPENWEATHER_API_KEY!,
  baseUrl: 'https://api.openweathermap.org/data/2.5',
});
```

**Rules:**
- ✅ One client per external service
- ✅ Export configured singleton instances
- ✅ Include retry logic and error handling
- ✅ Document all public methods
- ✅ Use environment variables for configuration
- ✅ Include request/response transformation
- ❌ No business logic (only client operations)
- ❌ No database access

---

### `/src/types` - TypeScript Type Definitions

**Purpose:** Centralized type definitions, interfaces, and type utilities.

**Structure:**
```
src/types/
├── index.ts                   # Re-exports all types
├── flight.ts                  # Flight-related types
├── weather.ts                 # Weather-related types
├── user.ts                    # User-related types
├── notification.ts            # Notification types
├── api.ts                     # API request/response types
├── next-auth.d.ts             # NextAuth type augmentation
└── prisma.ts                  # Prisma type utilities
```

**Type File Template:**
```typescript
/**
 * @fileoverview Flight booking type definitions
 * @module types/flight
 */

import type { Booking, User } from '@prisma/client';

/**
 * Flight booking status
 */
export type FlightStatus = 
  | 'SCHEDULED'    // Initial booking status
  | 'AT_RISK'      // Weather conflict detected
  | 'CANCELLED'    // Cancelled due to weather or user request
  | 'RESCHEDULED'  // Rescheduled to new time
  | 'COMPLETED';   // Flight completed

/**
 * Pilot training level for weather minimums
 */
export type TrainingLevel =
  | 'STUDENT'      // Student pilot (VFR only, strict minimums)
  | 'PRIVATE'      // Private pilot (VFR)
  | 'INSTRUMENT'   // Instrument rated (can fly IFR)
  | 'COMMERCIAL';  // Commercial pilot

/**
 * Weather minimums for each training level
 */
export interface WeatherMinimums {
  /** Minimum visibility in statute miles */
  visibility: number;
  /** Minimum ceiling in feet AGL (Above Ground Level) */
  ceiling: number | null;
  /** Maximum wind speed in knots */
  maxWindSpeed: number;
  /** Maximum crosswind component in knots */
  maxCrosswind: number;
  /** Whether IFR conditions are acceptable */
  allowIMC: boolean;
}

/**
 * Flight booking with related data
 */
export interface Flight extends Booking {
  student: User;
  instructor: User;
}

/**
 * Input for creating a new flight booking
 */
export interface CreateFlightInput {
  /** Student user ID */
  studentId: string;
  /** Instructor user ID */
  instructorId: string;
  /** Scheduled date and time */
  scheduledDate: Date;
  /** Departure location */
  departureLocation: LocationInput;
  /** Destination location (if cross-country) */
  destinationLocation?: LocationInput;
  /** Flight type/lesson focus */
  flightType: string;
  /** Duration in hours */
  duration: number;
  /** Optional notes */
  notes?: string;
}

/**
 * Location with coordinates
 */
export interface LocationInput {
  /** Location name (e.g., "KJFK - John F. Kennedy International") */
  name: string;
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
  /** ICAO airport code (if applicable) */
  icaoCode?: string;
}

/**
 * Input for updating a flight booking
 */
export type UpdateFlightInput = Partial<CreateFlightInput> & {
  /** Flight ID to update */
  id: string;
};

/**
 * Flight list query options
 */
export interface FlightListOptions {
  /** Filter by status */
  status?: FlightStatus;
  /** Filter by date range start */
  startDate?: Date;
  /** Filter by date range end */
  endDate?: Date;
  /** Number of results to return */
  limit?: number;
  /** Number of results to skip */
  offset?: number;
}

/**
 * Type guard to check if a string is a valid FlightStatus
 */
export function isFlightStatus(value: string): value is FlightStatus {
  return ['SCHEDULED', 'AT_RISK', 'CANCELLED', 'RESCHEDULED', 'COMPLETED'].includes(value);
}

/**
 * Type guard to check if a string is a valid TrainingLevel
 */
export function isTrainingLevel(value: string): value is TrainingLevel {
  return ['STUDENT', 'PRIVATE', 'INSTRUMENT', 'COMMERCIAL'].includes(value);
}
```

**Rules:**
- ✅ One file per domain/feature
- ✅ Export all types and interfaces
- ✅ Include JSDoc comments for all types
- ✅ Use descriptive names (avoid abbreviations)
- ✅ Include type guards where appropriate
- ✅ Re-export commonly used types from `index.ts`
- ❌ No implementation code (types only)
- ❌ No default exports

---

### `/src/utils` - Pure Utility Functions

**Purpose:** Pure functions with no side effects, used across the application.

**Structure:**
```
src/utils/
├── date-helpers.ts            # Date formatting and manipulation
├── validation.ts              # Validation helper functions
├── formatting.ts              # String and number formatting
├── calculations.ts            # Mathematical calculations
└── converters.ts              # Unit conversions
```

**Utility File Template:**
```typescript
/**
 * @fileoverview Date utility functions for flight scheduling
 * @module utils/date-helpers
 */

import { format, addHours, differenceInHours, isAfter, isBefore } from 'date-fns';

/**
 * Formats a date for display in the UI
 * 
 * @param date - Date to format
 * @param formatString - Format string (default: 'MMM dd, yyyy h:mm a')
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatFlightDate(new Date()) // "Nov 08, 2025 2:30 PM"
 * ```
 */
export function formatFlightDate(
  date: Date,
  formatString: string = 'MMM dd, yyyy h:mm a'
): string {
  return format(date, formatString);
}

/**
 * Calculates the time remaining until a flight
 * 
 * @param flightDate - Scheduled flight date
 * @returns Hours until flight (negative if in the past)
 * 
 * @example
 * ```ts
 * const hours = getHoursUntilFlight(flightDate);
 * if (hours < 24) {
 *   console.log('Flight is within 24 hours!');
 * }
 * ```
 */
export function getHoursUntilFlight(flightDate: Date): number {
  return differenceInHours(flightDate, new Date());
}

/**
 * Checks if a flight is within the weather monitoring window
 * 
 * @param flightDate - Scheduled flight date
 * @param windowHours - Monitoring window in hours (default: 48)
 * @returns True if flight is within monitoring window
 */
export function isWithinMonitoringWindow(
  flightDate: Date,
  windowHours: number = 48
): boolean {
  const now = new Date();
  const windowEnd = addHours(now, windowHours);
  
  return isAfter(flightDate, now) && isBefore(flightDate, windowEnd);
}

/**
 * Checks if a date is in the past
 * 
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return isBefore(date, new Date());
}
```

**Rules:**
- ✅ Pure functions only (no side effects)
- ✅ Group related functions in same file
- ✅ Document all functions with JSDoc
- ✅ Include usage examples in JSDoc
- ✅ Use descriptive function names
- ✅ Keep files under 300 lines
- ❌ No API calls or database access
- ❌ No state mutation

---

### `/src/constants` - Application Constants

**Purpose:** Centralized constant values used throughout the application.

**Structure:**
```
src/constants/
├── weather-minimums.ts        # Weather minimums by training level
├── flight-types.ts            # Flight type definitions
├── status-codes.ts            # Application status codes
└── validation-rules.ts        # Validation rule constants
```

**Constants File Template:**
```typescript
/**
 * @fileoverview Weather minimums for different pilot training levels
 * @module constants/weather-minimums
 */

import type { TrainingLevel, WeatherMinimums } from '@/types/flight';

/**
 * Weather minimums map by training level
 * Based on FAA regulations and flight school policies
 */
export const WEATHER_MINIMUMS: Record<TrainingLevel, WeatherMinimums> = {
  /**
   * Student Pilot Requirements:
   * - VFR only (Visual Flight Rules)
   * - Clear skies preferred
   * - Low wind speeds
   */
  STUDENT: {
    visibility: 5,           // 5 statute miles minimum
    ceiling: 3000,           // 3000 feet AGL minimum
    maxWindSpeed: 10,        // 10 knots maximum
    maxCrosswind: 5,         // 5 knots maximum crosswind
    allowIMC: false,         // No instrument conditions
  },

  /**
   * Private Pilot Requirements:
   * - VFR only
   * - Standard VFR minimums
   */
  PRIVATE: {
    visibility: 3,           // 3 statute miles minimum
    ceiling: 1000,           // 1000 feet AGL minimum
    maxWindSpeed: 20,        // 20 knots maximum
    maxCrosswind: 12,        // 12 knots maximum crosswind
    allowIMC: false,
  },

  /**
   * Instrument Rated Pilot Requirements:
   * - Can fly in IMC (Instrument Meteorological Conditions)
   * - Must avoid severe weather
   */
  INSTRUMENT: {
    visibility: 0.5,         // 0.5 statute miles minimum
    ceiling: null,           // No ceiling restriction
    maxWindSpeed: 30,        // 30 knots maximum
    maxCrosswind: 15,        // 15 knots maximum crosswind
    allowIMC: true,
  },

  /**
   * Commercial Pilot Requirements:
   * - Similar to instrument rated
   * - Higher wind tolerances
   */
  COMMERCIAL: {
    visibility: 0.5,
    ceiling: null,
    maxWindSpeed: 35,
    maxCrosswind: 18,
    allowIMC: true,
  },
};

/**
 * Weather conditions that are always prohibitive regardless of training level
 */
export const PROHIBITIVE_CONDITIONS = [
  'thunderstorm',
  'severe icing',
  'tornado',
  'microburst',
  'volcanic ash',
] as const;

/**
 * Weather check interval in milliseconds (1 hour)
 */
export const WEATHER_CHECK_INTERVAL = 60 * 60 * 1000;

/**
 * Weather monitoring window in hours (48 hours before flight)
 */
export const WEATHER_MONITORING_WINDOW_HOURS = 48;
```

**Rules:**
- ✅ Use SCREAMING_SNAKE_CASE for constants
- ✅ Group related constants in same file
- ✅ Document the purpose and units of each constant
- ✅ Use `as const` for readonly arrays and objects
- ✅ Export individual constants (not default export)
- ❌ No computed values (must be literal constants)
- ❌ No functions

---

# File Organization Rules

## File Naming Conventions

### TypeScript/JavaScript Files

| Type | Convention | Example |
|------|------------|---------|
| **Components** | kebab-case.tsx | `flight-card.tsx` |
| **Pages** | page.tsx | `page.tsx` |
| **Layouts** | layout.tsx | `layout.tsx` |
| **API Routes** | route.ts | `route.ts` |
| **Services** | kebab-case-service.ts | `flight-service.ts` |
| **Utilities** | kebab-case.ts | `date-helpers.ts` |
| **Types** | kebab-case.ts | `flight.ts` |
| **Constants** | kebab-case.ts | `weather-minimums.ts` |
| **Hooks** | use-kebab-case.ts | `use-flights.ts` |
| **Tests** | \*.test.ts or \*.spec.ts | `flight-service.test.ts` |

### Naming Rules
- ✅ Use descriptive, meaningful names
- ✅ Use kebab-case for multi-word file names
- ✅ Include the type in the name (e.g., `-service`, `-client`, `-utils`)
- ✅ Match file name to main export (e.g., `FlightCard` in `flight-card.tsx`)
- ❌ Avoid generic names (e.g., `utils.ts`, `helpers.ts`)
- ❌ Avoid abbreviations (e.g., use `notification` not `notif`)

---

## File Header Documentation

**Every file must start with a file-level JSDoc comment.**

### Template

```typescript
/**
 * @fileoverview Brief description of file's purpose and contents
 * @module Relative module path (e.g., components/flights/flight-card)
 * @author Your Name (optional)
 * @created 2025-11-08 (optional)
 */
```

### Examples

**Component:**
```typescript
/**
 * @fileoverview Flight booking card component with status badge and actions
 * @module components/flights/flight-card
 */
```

**Service:**
```typescript
/**
 * @fileoverview Weather monitoring service - checks flights against weather minimums
 * @module services/weather-service
 */
```

**Type:**
```typescript
/**
 * @fileoverview Type definitions for flight booking domain
 * @module types/flight
 */
```

**Utility:**
```typescript
/**
 * @fileoverview Date manipulation and formatting utilities for flight scheduling
 * @module utils/date-helpers
 */
```

---

# Naming Conventions

## TypeScript Naming

| Element | Convention | Example |
|---------|------------|---------|
| **Variables** | camelCase | `flightDate`, `userId` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_WIND_SPEED` |
| **Functions** | camelCase | `calculateWindSpeed()` |
| **Classes** | PascalCase | `FlightService` |
| **Interfaces** | PascalCase | `FlightData` |
| **Types** | PascalCase | `FlightStatus` |
| **Enums** | PascalCase | `TrainingLevel` |
| **Generic Types** | T, TData, TError | `<TData, TError>` |
| **Private Members** | Prefix with _ (optional) | `_internalState` |

## React Naming

| Element | Convention | Example |
|---------|------------|---------|
| **Components** | PascalCase | `FlightCard` |
| **Hooks** | camelCase with `use` prefix | `useFlights()` |
| **Props Interfaces** | ComponentName + Props | `FlightCardProps` |
| **Context** | PascalCase + Context | `FlightContext` |
| **Providers** | PascalCase + Provider | `FlightProvider` |

## Database Naming (Prisma)

| Element | Convention | Example |
|---------|------------|---------|
| **Models** | PascalCase (singular) | `Booking`, `User` |
| **Fields** | camelCase | `scheduledDate`, `userId` |
| **Tables** | snake_case (plural) | `bookings`, `users` |
| **Columns** | snake_case | `scheduled_date`, `user_id` |

---

# Documentation Standards

## JSDoc/TSDoc Requirements

**All functions, classes, and interfaces must have documentation.**

### Function Documentation Template

```typescript
/**
 * Brief one-line description of what the function does
 * 
 * More detailed explanation if needed. Can span multiple lines
 * and include implementation details or important notes.
 * 
 * @param paramName - Description of parameter and its purpose
 * @param optionalParam - Description (optional if not obvious)
 * @returns Description of return value
 * 
 * @throws ErrorType Description of when/why this error is thrown
 * 
 * @example
 * ```ts
 * const result = myFunction('value', 42);
 * console.log(result);
 * ```
 * 
 * @see RelatedFunction For related functionality
 * @deprecated Use newFunction() instead (if deprecated)
 */
export function myFunction(
  paramName: string,
  optionalParam?: number
): ReturnType {
  // Implementation
}
```

### Interface Documentation Template

```typescript
/**
 * Description of what this interface represents
 */
export interface MyInterface {
  /** Description of this property */
  propertyName: string;
  
  /** 
   * More detailed description if needed
   * Can span multiple lines
   */
  complexProperty: ComplexType;
  
  /** Optional property description */
  optionalProperty?: number;
}
```

### Class Documentation Template

```typescript
/**
 * Brief description of class purpose
 * 
 * More detailed explanation of class responsibilities
 * and usage patterns.
 * 
 * @example
 * ```ts
 * const service = new MyService();
 * await service.doSomething();
 * ```
 */
export class MyService {
  /**
   * Constructor description
   * 
   * @param dependency - Injected dependency
   */
  constructor(private dependency: Dependency) {}

  /**
   * Method description
   * 
   * @param param - Parameter description
   * @returns Return value description
   */
  public async doSomething(param: string): Promise<Result> {
    // Implementation
  }
}
```

---

# Code Organization

## Import Organization

**Imports must be organized in the following order:**

```typescript
// 1. External dependencies (third-party packages)
import React from 'react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';

// 2. Internal absolute imports - Components
import { Button } from '@/components/ui/button';
import { FlightCard } from '@/components/flights/flight-card';

// 3. Internal absolute imports - Types
import type { Flight, FlightStatus } from '@/types/flight';

// 4. Internal absolute imports - Utilities
import { formatFlightDate } from '@/utils/date-helpers';
import { weatherClient } from '@/lib/weather';

// 5. Relative imports (avoid if possible)
import { helperFunction } from './helpers';

// 6. Styles (if applicable)
import styles from './styles.module.css';
```

**Rules:**
- ✅ Group imports by category with blank lines between
- ✅ Sort alphabetically within each group
- ✅ Use `import type` for type-only imports
- ✅ Prefer absolute imports (`@/`) over relative imports
- ❌ No wildcard imports (`import * as`)
- ❌ No mixing default and named imports from same module

---

## Function Organization

**Within a file, organize functions in this order:**

```typescript
// 1. File-level documentation
/**
 * @fileoverview ...
 */

// 2. Imports
import ...

// 3. Type definitions (if not in separate file)
interface Props { ... }

// 4. Constants
const MAX_RETRIES = 3;

// 5. Main exports (component, service class, etc.)
export function MyComponent() { ... }

// 6. Helper functions (private to this file)
function helperFunction() { ... }

// 7. Type guards and validators
function isValidType(value: unknown): value is Type { ... }
```

**Function Size Guidelines:**
- ✅ Keep functions under 50 lines
- ✅ Extract complex logic to helper functions
- ✅ Single responsibility per function
- ❌ No nested functions (extract to file level)

---

## Component Structure

**React components should follow this structure:**

```typescript
/**
 * @fileoverview Component description
 * @module components/path/component-name
 */

import React from 'react';
// ... other imports

/**
 * Props interface
 */
interface ComponentNameProps {
  /** Prop descriptions */
  propName: string;
}

/**
 * Component description
 * 
 * @param props - Component props
 * @returns Rendered component
 */
export function ComponentName({ propName }: ComponentNameProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState<string>('');
  const data = useCustomHook();
  
  // 2. Derived state and computations
  const computedValue = useMemo(() => {
    return expensiveComputation(state);
  }, [state]);
  
  // 3. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, []);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Early returns (loading, error states)
  if (!data) {
    return <LoadingSpinner />;
  }
  
  // 6. Main render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

// 7. Sub-components (if any, prefer separate files)
function SubComponent() {
  return <div>...</div>;
}
```

---

# TypeScript Guidelines

## Type Safety Rules

1. **Always use strict mode**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

2. **Avoid `any`**
   ```typescript
   // ❌ Bad
   function process(data: any) { ... }
   
   // ✅ Good
   function process(data: unknown) {
     if (typeof data === 'string') {
       // Type narrowed to string
     }
   }
   ```

3. **Use type guards**
   ```typescript
   function isFlightStatus(value: string): value is FlightStatus {
     return ['SCHEDULED', 'CANCELLED', 'COMPLETED'].includes(value);
   }
   ```

4. **Prefer interfaces for objects, types for unions**
   ```typescript
   // ✅ Interface for object shape
   interface User {
     id: string;
     name: string;
   }
   
   // ✅ Type for union
   type Status = 'active' | 'inactive';
   ```

---

# Component Architecture

## Component Size Limits

| Component Type | Max Lines | Max Props |
|----------------|-----------|-----------|
| **Page Component** | 300 | 5 |
| **UI Component** | 200 | 10 |
| **Form Component** | 250 | 8 |
| **Container Component** | 300 | 7 |

**When approaching limits:**
- Extract sub-components
- Move logic to hooks
- Split into multiple components
- Move complex logic to services

---

## Component Composition Patterns

### Container/Presentation Pattern

```typescript
// Container (logic)
export function FlightListContainer() {
  const { data, isLoading } = useFlights();
  const handleDelete = useDeleteFlight();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <FlightList 
      flights={data} 
      onDelete={handleDelete}
    />
  );
}

// Presentation (UI only)
interface FlightListProps {
  flights: Flight[];
  onDelete: (id: string) => void;
}

export function FlightList({ flights, onDelete }: FlightListProps) {
  return (
    <div>
      {flights.map(flight => (
        <FlightCard key={flight.id} flight={flight} onDelete={onDelete} />
      ))}
    </div>
  );
}
```

---

## Custom Hooks

**Extract reusable logic to custom hooks:**

```typescript
/**
 * @fileoverview Custom hook for fetching and managing flights
 * @module hooks/use-flights
 */

import { trpc } from '@/lib/trpc';
import type { FlightListOptions } from '@/types/flight';

/**
 * Hook for fetching flights with filtering
 * 
 * @param options - Query options (status, pagination)
 * @returns Query result with flights data
 * 
 * @example
 * ```tsx
 * function FlightList() {
 *   const { data, isLoading } = useFlights({ status: 'SCHEDULED' });
 *   // ...
 * }
 * ```
 */
export function useFlights(options?: FlightListOptions) {
  return trpc.flights.list.useQuery(options, {
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
```

**Hook Rules:**
- ✅ Start name with `use`
- ✅ One hook per file
- ✅ Document parameters and return value
- ✅ Include usage example
- ❌ No side effects outside of useEffect

---

# Testing Standards

## Test File Organization

```
tests/
├── unit/                          # Unit tests
│   ├── services/
│   │   └── flight-service.test.ts
│   ├── utils/
│   │   └── date-helpers.test.ts
│   └── lib/
│       └── weather.test.ts
│
├── integration/                   # Integration tests
│   ├── api/
│   │   └── flights.test.ts
│   └── services/
│       └── weather-monitor.test.ts
│
└── e2e/                           # End-to-end tests (optional)
    └── booking-flow.test.ts
```

## Test Template

```typescript
/**
 * @fileoverview Unit tests for flight service
 * @module tests/unit/services/flight-service.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flightService } from '@/services/flight-service';
import { db } from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db');

describe('FlightService', () => {
  // Setup
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    // Cleanup after each test
  });

  describe('createFlight', () => {
    it('should create a flight with valid data', async () => {
      // Arrange
      const mockFlight = {
        id: '123',
        scheduledDate: new Date(),
        status: 'SCHEDULED',
      };
      
      vi.mocked(db.booking.create).mockResolvedValue(mockFlight);
      
      // Act
      const result = await flightService.createFlight('user-id', {
        scheduledDate: new Date(),
        // ... other fields
      });
      
      // Assert
      expect(result).toEqual(mockFlight);
      expect(db.booking.create).toHaveBeenCalledOnce();
    });
    
    it('should throw error when instructor unavailable', async () => {
      // Arrange
      // ... setup
      
      // Act & Assert
      await expect(
        flightService.createFlight('user-id', data)
      ).rejects.toThrow('Instructor not available');
    });
  });
});
```

**Testing Rules:**
- ✅ One test file per source file
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Test edge cases and error conditions
- ✅ Mock external dependencies
- ✅ Keep tests under 50 lines each
- ❌ No interdependent tests

---

# Git Workflow

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| **Feature** | `feature/description` | `feature/weather-monitoring` |
| **Bug Fix** | `fix/description` | `fix/notification-email-format` |
| **Hotfix** | `hotfix/description` | `hotfix/critical-weather-api-error` |
| **Refactor** | `refactor/description` | `refactor/flight-service-split` |
| **Docs** | `docs/description` | `docs/api-documentation` |

## Commit Messages

**Format:**
```
type(scope): brief description

Detailed explanation of changes (if needed).
Can span multiple lines.

- Additional notes
- Breaking changes
- Issue references (#123)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions/changes
- `chore`: Build, dependencies, etc.

**Examples:**
```
feat(flights): add weather conflict detection

Implemented automatic weather monitoring that checks flights
against training level minimums every hour.

- Added weather-monitor service
- Integrated with OpenWeatherMap API
- Created weather validation logic

Closes #42
```

---

# AI-First Best Practices

## Context Optimization

1. **Clear File Boundaries**
   - Each file should be independently understandable
   - Minimal external context needed to understand a file
   - Well-documented imports and exports

2. **Descriptive Naming**
   - AI tools rely on naming for context
   - Use full words, avoid abbreviations
   - Names should describe purpose and behavior

3. **Inline Documentation**
   - AI tools parse JSDoc for context
   - Document all public APIs
   - Include examples in documentation

4. **Type-First Development**
   - Types serve as documentation
   - AI tools use types for suggestions
   - Strong typing reduces ambiguity

## AI Tool Integration

### GitHub Copilot Best Practices
- Write clear function signatures before implementation
- Use descriptive variable names
- Add comments for complex logic
- Accept suggestions critically

### Cursor/AI Assistant Best Practices
- Reference this document in prompts
- Point to specific files when asking questions
- Ask for explanations of suggested changes
- Request adherence to project conventions

---

# Enforcement & Quality

## Automated Checks

### Pre-commit Hooks (Husky)
```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test:unit
```

### CI/CD Checks
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Unit tests (100% must pass)
- ✅ Integration tests
- ✅ File size check (max 500 lines)
- ✅ Import organization check

## Code Review Checklist

- [ ] File is under 500 lines
- [ ] File has header documentation
- [ ] All functions have JSDoc comments
- [ ] Naming follows conventions
- [ ] No circular dependencies
- [ ] Tests are included and passing
- [ ] Types are properly defined
- [ ] No `any` types used
- [ ] Error handling is present
- [ ] Code is self-documenting

---

# Summary

## Key Takeaways

1. **500-line maximum** for all files
2. **Every file has documentation** at the top
3. **Every function has JSDoc** comments
4. **Descriptive naming** throughout
5. **Modular architecture** with clear boundaries
6. **Type-safe** development (no `any`)
7. **Single responsibility** per file/function
8. **AI-optimized** for maximum comprehension

## Quick Reference

### File Header
```typescript
/**
 * @fileoverview Description
 * @module path/to/file
 */
```

### Function Documentation
```typescript
/**
 * Description
 * 
 * @param name - Description
 * @returns Description
 * 
 * @example
 * ```ts
 * example();
 * ```
 */
```

### Component Structure
```typescript
1. File header
2. Imports (organized)
3. Types/interfaces
4. Component function
5. Helper functions
```

---

**Last Updated:** November 8, 2025

**Questions?** Refer to:
- `tech-stack.md` for technology-specific best practices
- `user-flow.md` for feature understanding
- `project-overview.md` for project requirements

**Remember:** These rules exist to make the codebase:
- ✅ Easy to understand (for humans and AI)
- ✅ Easy to navigate
- ✅ Easy to maintain
- ✅ Easy to scale

Follow them consistently for maximum productivity! 🚀

