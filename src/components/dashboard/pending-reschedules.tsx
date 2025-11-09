/**
 * @fileoverview Pending reschedules widget for instructors
 * @module components/dashboard/pending-reschedules
 */

'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

/**
 * Pending reschedules widget component
 * Displays reschedule requests awaiting instructor approval
 * 
 * @returns Rendered pending reschedules widget
 */
export function PendingReschedules() {
  const { data: session } = useSession();
  const isInstructor = session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN';

  const { data: pendingReschedules, isLoading } = trpc.reschedule.listPending.useQuery(
    undefined,
    { enabled: isInstructor }
  );

  if (!isInstructor) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Reschedules</CardTitle>
          <CardDescription>Reschedule requests awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const pending = pendingReschedules || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Reschedules</CardTitle>
        <CardDescription>Reschedule requests awaiting your approval</CardDescription>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <EmptyState
            title="All Clear"
            description="No pending reschedule requests."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((reschedule) => {
              if (!reschedule.booking) return null;
              
              const booking = reschedule.booking;
              const departureLocation = booking.departureLocation as any;
              const locationName = departureLocation?.name || 'Unknown';

              return (
                <Link key={reschedule.id} href={`/dashboard/flights/${booking.id}`}>
                  <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <p className="font-semibold text-sm">
                            {booking.student.name || booking.student.email}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Needs Approval
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {locationName}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Original: {format(new Date(booking.scheduledDate), 'MMM dd, h:mm a')}
                          </span>
                          <span className="text-blue-600 font-medium">
                            → {format(new Date(reschedule.proposedDate), 'MMM dd, h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {reschedule.aiReasoning && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {reschedule.aiReasoning}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
            {pending.length > 3 && (
              <div className="pt-2">
                <Link href="/dashboard/flights?status=AT_RISK">
                  <button className="text-sm text-primary hover:underline w-full text-left">
                    View all pending requests →
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

