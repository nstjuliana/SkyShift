/**
 * @fileoverview Environment variable validation using Zod
 * @module lib/env
 * 
 * Validates required environment variables at application startup
 */

import { z } from 'zod';

/**
 * Environment variable schema
 * During build time, some variables may not be available, so we make them optional
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().min(1).optional(),
  // Optional for Phase 0, required for Phase 1+
  OPENAI_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  TOMORROW_IO_API_KEY: z.string().optional(),
  AIRPORTDB_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

/**
 * Validated environment variables
 * Uses safeParse to avoid throwing during build if variables are missing
 */
const parseResult = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
  TOMORROW_IO_API_KEY: process.env.TOMORROW_IO_API_KEY,
  AIRPORTDB_API_KEY: process.env.AIRPORTDB_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
});

/**
 * Exported environment variables
 * Returns parsed env or empty object if validation fails (e.g., during build)
 */
export const env = parseResult.success ? parseResult.data : {};

