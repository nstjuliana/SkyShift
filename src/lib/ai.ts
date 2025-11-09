/**
 * @fileoverview OpenAI client configuration for AI-powered rescheduling
 * @module lib/ai
 */

import OpenAI from 'openai';

/**
 * OpenAI client instance
 * Configured with API key from environment variables
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI model to use for rescheduling
 * Using GPT-4o-mini for cost-effectiveness and speed
 */
export const AI_MODEL = 'gpt-4o-mini';

/**
 * Temperature setting for AI responses
 * Lower temperature (0.3) for more deterministic scheduling outputs
 */
export const AI_TEMPERATURE = 0.3;

