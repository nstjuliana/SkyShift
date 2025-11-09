"use strict";
/**
 * @fileoverview Environment variable validation using Zod
 * @module lib/env
 *
 * Validates required environment variables at application startup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
/**
 * Environment variable schema
 */
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url().min(1),
    AUTH_SECRET: zod_1.z.string().min(1).optional(),
    NEXTAUTH_SECRET: zod_1.z.string().min(1).optional(),
    NEXTAUTH_URL: zod_1.z.string().url().min(1),
    // Optional for Phase 0, required for Phase 1+
    OPENAI_API_KEY: zod_1.z.string().optional(),
    OPENWEATHER_API_KEY: zod_1.z.string().optional(),
    TOMORROW_IO_API_KEY: zod_1.z.string().optional(),
    AIRPORTDB_API_KEY: zod_1.z.string().optional(),
    RESEND_API_KEY: zod_1.z.string().optional(),
    RESEND_FROM_EMAIL: zod_1.z.string().email().optional(),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().optional(),
    AWS_S3_BUCKET: zod_1.z.string().optional(),
});
/**
 * Validated environment variables
 */
exports.env = envSchema.parse({
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
