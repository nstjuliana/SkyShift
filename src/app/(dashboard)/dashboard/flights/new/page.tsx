/**
 * @fileoverview New flight booking page
 * @module app/(dashboard)/dashboard/flights/new/page
 */

import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { FlightForm } from '@/components/flights/flight-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';

/**
 * New flight booking page
 * 
 * @returns Rendered new flight page
 */
export default async function NewFlightPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Get available instructors
  const instructors = await db.user.findMany({
    where: {
      role: 'INSTRUCTOR',
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule New Flight</h1>
        <p className="text-muted-foreground mt-2">
          Create a new flight booking
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flight Details</CardTitle>
          <CardDescription>Enter the details for your flight booking</CardDescription>
        </CardHeader>
        <CardContent>
          <FlightForm
            defaultStudentId={session.user.id}
            instructors={instructors}
          />
        </CardContent>
      </Card>
    </div>
  );
}

