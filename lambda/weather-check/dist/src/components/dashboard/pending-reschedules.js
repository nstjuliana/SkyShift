"use strict";
/**
 * @fileoverview Pending reschedules widget for instructors
 * @module components/dashboard/pending-reschedules
 */
'use client';
/**
 * @fileoverview Pending reschedules widget for instructors
 * @module components/dashboard/pending-reschedules
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingReschedules = PendingReschedules;
const trpc_1 = require("@/lib/trpc");
const card_1 = require("@/components/ui/card");
const loading_spinner_1 = require("@/components/common/loading-spinner");
const empty_state_1 = require("@/components/common/empty-state");
const badge_1 = require("@/components/ui/badge");
const link_1 = __importDefault(require("next/link"));
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const react_1 = require("next-auth/react");
/**
 * Pending reschedules widget component
 * Displays reschedule requests awaiting instructor approval
 *
 * @returns Rendered pending reschedules widget
 */
function PendingReschedules() {
    const { data: session } = (0, react_1.useSession)();
    const isInstructor = session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN';
    const { data: pendingReschedules, isLoading } = trpc_1.trpc.reschedule.listPending.useQuery(undefined, { enabled: isInstructor });
    if (!isInstructor) {
        return null;
    }
    if (isLoading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Pending Reschedules</card_1.CardTitle>
          <card_1.CardDescription>Reschedule requests awaiting approval</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <loading_spinner_1.LoadingSpinner />
        </card_1.CardContent>
      </card_1.Card>);
    }
    const pending = pendingReschedules || [];
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Pending Reschedules</card_1.CardTitle>
        <card_1.CardDescription>Reschedule requests awaiting your approval</card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        {pending.length === 0 ? (<empty_state_1.EmptyState title="All Clear" description="No pending reschedule requests."/>) : (<div className="space-y-3">
            {pending.map((reschedule) => {
                if (!reschedule.booking)
                    return null;
                const booking = reschedule.booking;
                const departureLocation = booking.departureLocation;
                const locationName = departureLocation?.name || 'Unknown';
                return (<link_1.default key={reschedule.id} href={`/dashboard/flights/${booking.id}`}>
                  <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <lucide_react_1.Clock className="h-4 w-4 text-blue-600"/>
                          <p className="font-semibold text-sm">
                            {booking.student.name || booking.student.email}
                          </p>
                          <badge_1.Badge variant="outline" className="text-xs">
                            Needs Approval
                          </badge_1.Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {locationName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Original: {(0, date_fns_1.format)(new Date(booking.scheduledDate), 'MMM dd, h:mm a')}
                          </span>
                          <span className="text-blue-600 font-medium">
                            → {(0, date_fns_1.format)(new Date(reschedule.proposedDate), 'MMM dd, h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {reschedule.aiReasoning && (<p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {reschedule.aiReasoning}
                      </p>)}
                  </div>
                </link_1.default>);
            })}
            {pending.length > 3 && (<div className="pt-2">
                <link_1.default href="/dashboard/flights?status=AT_RISK">
                  <button className="text-sm text-primary hover:underline w-full text-left">
                    View all pending requests →
                  </button>
                </link_1.default>
              </div>)}
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
