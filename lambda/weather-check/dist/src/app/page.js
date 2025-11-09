"use strict";
/**
 * @fileoverview Home page - redirects to dashboard
 * @module app/page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const navigation_1 = require("next/navigation");
const auth_server_1 = require("@/lib/auth-server");
/**
 * Home page component
 *
 * Redirects authenticated users to dashboard, others to login
 *
 * @returns Redirect component
 */
async function Home() {
    const session = await (0, auth_server_1.getServerSession)();
    if (session) {
        (0, navigation_1.redirect)('/dashboard');
    }
    else {
        (0, navigation_1.redirect)('/login');
    }
}
