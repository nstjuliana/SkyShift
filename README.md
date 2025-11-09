# SkyShift

Weather Cancellation & AI Rescheduling System

## Overview

SkyShift is an automated weather monitoring and AI-powered flight rescheduling system for flight training schools. It automatically detects weather conflicts based on pilot training levels and suggests optimal rescheduling options using AI.

## Features

- **Automated Weather Monitoring** - Hourly checks for upcoming flights
- **Training Level-Based Conflict Detection** - Different weather minimums for Student Pilots vs Instrument Rated
- **AI-Powered Rescheduling** - OpenAI generates 3 optimal reschedule options
- **Email Notifications** - Automated alerts for weather conflicts
- **Dashboard** - Real-time flight status and weather alerts
- **Role-Based Access** - Students, Instructors, and Admins

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, tRPC, Prisma ORM
- **Database:** PostgreSQL (Supabase or AWS RDS)
- **Authentication:** NextAuth.js v5
- **AI:** OpenAI GPT-4o-mini (Vercel AI SDK)
- **Email:** Resend
- **State Management:** React Query, Zustand
- **Deployment:** AWS Amplify (Frontend), AWS Lambda (Background Jobs)
- **Monitoring:** AWS CloudWatch

## Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15.x (or AWS RDS)
- pnpm (or npm/yarn)

## Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd skyshift
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (AWS RDS format with `?sslmode=require`)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your application URL (e.g., `http://localhost:3000`)

Optional (for Phase 1+):
- `OPENAI_API_KEY` - OpenAI API key
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `RESEND_API_KEY` - Resend email API key

### 4. Set Up Database

```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with test users
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Credentials

After seeding the database, you can log in with:

- **Student:** `student@skyshift.com` / `password123`
- **Instructor:** `instructor@skyshift.com` / `password123`
- **Admin:** `admin@skyshift.com` / `password123`

## Project Structure

```
skyshift/
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── server/          # tRPC routers and server logic
│   ├── services/        # Business logic
│   ├── lib/             # Utilities and clients
│   └── types/           # TypeScript types
└── _docs/               # Project documentation
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for a complete list of environment variables. Key variables:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (Supabase format: `postgresql://user:password@host:5432/dbname?sslmode=require`)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Application URL (`http://localhost:3000` for dev, full Amplify app URL for prod, e.g., `https://main.d2q7ne5hrd77na.amplifyapp.com`)
- `OPENAI_API_KEY` - OpenAI API key for AI rescheduling
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `RESEND_API_KEY` - Resend email API key
- `RESEND_FROM_EMAIL` - Email sender address (optional - defaults to `onboarding@resend.dev`)

**Optional:**
- `TOMORROW_IO_API_KEY` - Tomorrow.io API key (for detailed forecasts)
- `AIRPORTDB_API_KEY` - AirportDB API key (for runway data)
- `NEXT_PUBLIC_APP_URL` - Public application URL (fallback if NEXTAUTH_URL not set)

## Deployment

### AWS Amplify Deployment

SkyShift is deployed to AWS Amplify for hosting. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Connect GitHub repository to AWS Amplify
2. Configure build settings (auto-detected for Next.js)
3. Set environment variables in Amplify Console
4. Deploy

### AWS Lambda Function

The weather check Lambda function runs hourly via EventBridge. See [lambda/weather-check/README.md](lambda/weather-check/README.md) for Lambda deployment instructions.

**Quick Steps:**
1. Build Lambda function: `cd lambda/weather-check && npm run build`
2. Create zip: `cd dist && zip -r ../../function.zip .`
3. Upload to AWS Lambda Console
4. Configure EventBridge schedule: `cron(0 * * * ? *)` (hourly)
5. Set environment variables

## Database Configuration

### Supabase PostgreSQL

For Supabase, use this DATABASE_URL format:

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require
```

### AWS RDS PostgreSQL

For AWS RDS, use this DATABASE_URL format:

```
postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/dbname?sslmode=require
```

Ensure:
- SSL mode is set to `require`
- Security group allows connections from your IP/Amplify
- Database is publicly accessible (or use VPN/bastion)

## Documentation

- [Project Overview](_docs/Project%20Overview.md) - Requirements and objectives
- [User Flow](_docs/user-flow.md) - User journey documentation
- [Tech Stack](_docs/tech-stack.md) - Technology decisions and best practices
- [Project Rules](_docs/project-rules.md) - Coding standards and conventions
- [Development Phases](_docs/phases/) - Phase-by-phase implementation guide
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Lambda Deployment](lambda/weather-check/README.md) - Lambda function setup

## License

Private project - All rights reserved

