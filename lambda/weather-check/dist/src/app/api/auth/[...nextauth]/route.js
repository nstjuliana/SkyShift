"use strict";
/**
 * @fileoverview NextAuth.js API route handler
 * @module app/api/auth/[...nextauth]/route
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = exports.auth = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const auth_1 = require("@/lib/auth");
/**
 * NextAuth handler instance
 */
const { handlers, auth } = (0, next_auth_1.default)(auth_1.authOptions);
exports.auth = auth;
/**
 * Next.js route handlers
 * NextAuth v5 beta exports handlers object with GET and POST
 */
exports.GET = handlers.GET, exports.POST = handlers.POST;
