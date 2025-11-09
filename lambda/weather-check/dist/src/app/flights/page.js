"use strict";
/**
 * @fileoverview Redirect route for /flights to /dashboard/flights
 * @module app/flights/page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FlightsRedirect;
const navigation_1 = require("next/navigation");
/**
 * Redirects /flights to /dashboard/flights
 */
function FlightsRedirect() {
    (0, navigation_1.redirect)('/dashboard/flights');
}
