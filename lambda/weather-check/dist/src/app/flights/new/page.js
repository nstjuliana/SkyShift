"use strict";
/**
 * @fileoverview Redirect route for /flights/new to /dashboard/flights/new
 * @module app/flights/new/page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewFlightRedirect;
const navigation_1 = require("next/navigation");
/**
 * Redirects /flights/new to /dashboard/flights/new
 */
function NewFlightRedirect() {
    (0, navigation_1.redirect)('/dashboard/flights/new');
}
