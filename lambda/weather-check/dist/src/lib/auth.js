"use strict";
/**
 * @fileoverview NextAuth.js configuration for SkyShift
 * @module lib/auth
 *
 * Configured with credentials provider and JWT sessions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * NextAuth configuration options
 */
exports.authOptions = {
    secret: process.env.AUTH_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        (process.env.NODE_ENV === 'development'
            ? 'development-secret-key-minimum-32-characters-long-for-nextauth'
            : undefined),
    // Note: Credentials provider requires JWT strategy, not database sessions
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    providers: [
        (0, credentials_1.default)({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            /**
             * Authorize user with email and password
             *
             * @param credentials - User credentials
             * @returns User object if valid, null otherwise
             */
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = await db_1.db.user.findUnique({
                    where: { email: credentials.email },
                });
                if (!user || !user.password) {
                    return null;
                }
                const isValid = await bcryptjs_1.default.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    trainingLevel: user.trainingLevel,
                    temperatureUnit: user.temperatureUnit,
                };
            },
        }),
    ],
    callbacks: {
        /**
         * Add custom fields to JWT token
         */
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.trainingLevel = user.trainingLevel;
                token.temperatureUnit = user.temperatureUnit;
            }
            return token;
        },
        /**
         * Add custom fields to session from JWT token
         */
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.trainingLevel = token.trainingLevel;
                session.user.temperatureUnit = token.temperatureUnit || 'FAHRENHEIT';
            }
            return session;
        },
    },
};
