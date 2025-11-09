"use strict";
/**
 * @fileoverview Root layout for Next.js application
 * @module app/layout
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
const providers_1 = require("./providers");
const toaster_1 = require("@/components/ui/toaster");
require("./globals.css");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'SkyShift - Weather Cancellation & AI Rescheduling',
    description: 'Automated weather monitoring and AI-powered flight rescheduling',
};
/**
 * Root layout component
 *
 * @param children - Child components to render
 * @returns Root layout with global styles and providers
 */
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={inter.className}>
        <providers_1.Providers>
          {children}
          <toaster_1.Toaster />
        </providers_1.Providers>
      </body>
    </html>);
}
