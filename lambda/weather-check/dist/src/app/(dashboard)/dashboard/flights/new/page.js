"use strict";
/**
 * @fileoverview New flight booking page
 * @module app/(dashboard)/dashboard/flights/new/page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewFlightPage;
const auth_server_1 = require("@/lib/auth-server");
const navigation_1 = require("next/navigation");
const flight_form_1 = require("@/components/flights/flight-form");
const card_1 = require("@/components/ui/card");
const db_1 = require("@/lib/db");
/**
 * New flight booking page
 *
 * @returns Rendered new flight page
 */
async function NewFlightPage() {
    const session = await (0, auth_server_1.getServerSession)();
    if (!session?.user) {
        (0, navigation_1.redirect)('/login');
    }
    // Get available instructors
    const instructors = await db_1.db.user.findMany({
        where: {
            role: 'INSTRUCTOR',
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule New Flight</h1>
        <p className="text-muted-foreground mt-2">
          Create a new flight booking
        </p>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Flight Details</card_1.CardTitle>
          <card_1.CardDescription>Enter the details for your flight booking</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <flight_form_1.FlightForm defaultStudentId={session.user.id} instructors={instructors}/>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
