"use strict";
/**
 * @fileoverview OpenAI client configuration for AI-powered rescheduling
 * @module lib/ai
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_TEMPERATURE = exports.AI_MODEL = exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
/**
 * OpenAI client instance
 * Configured with API key from environment variables
 */
exports.openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * AI model to use for rescheduling
 * Using GPT-4o-mini for cost-effectiveness and speed
 */
exports.AI_MODEL = 'gpt-4o-mini';
/**
 * Temperature setting for AI responses
 * Lower temperature (0.3) for more deterministic scheduling outputs
 */
exports.AI_TEMPERATURE = 0.3;
