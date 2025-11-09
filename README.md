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
- **Database:** PostgreSQL (AWS RDS)
- **Authentication:** NextAuth.js v5
- **AI:** OpenAI GPT-4o-mini (Vercel AI SDK)
- **Email:** Resend
- **State Management:** React Query, Zustand

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

## Documentation

- [Project Overview](_docs/Project%20Overview.md) - Requirements and objectives
- [User Flow](_docs/user-flow.md) - User journey documentation
- [Tech Stack](_docs/tech-stack.md) - Technology decisions and best practices
- [Project Rules](_docs/project-rules.md) - Coding standards and conventions
- [Development Phases](_docs/phases/) - Phase-by-phase implementation guide

## AWS RDS Configuration

For AWS RDS PostgreSQL, use this DATABASE_URL format:

```
postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/dbname?sslmode=require
```

Ensure:
- SSL mode is set to `require`
- Security group allows connections from your IP
- Database is publicly accessible (or use VPN/bastion)

## License

Private project - All rights reserved

