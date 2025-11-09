/**
 * @fileoverview User profile page
 * @module app/(dashboard)/dashboard/profile/page
 */

'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, GraduationCap, Thermometer } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

/**
 * User profile page component
 * 
 * @returns Rendered profile page
 */
export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();

  const { data: profile, refetch } = trpc.users.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const updateTemperatureUnit = trpc.users.updateTemperatureUnit.useMutation({
    onSuccess: async (data) => {
      // Update the session with new temperature unit
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          temperatureUnit: data.temperatureUnit,
        },
      });
      toast({
        title: 'Preference updated',
        description: 'Your temperature unit preference has been updated.',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preference.',
        variant: 'destructive',
      });
    },
  });

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const currentTemperatureUnit = profile?.temperatureUnit || user.temperatureUnit || 'FAHRENHEIT';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {user.name || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>

          {user.trainingLevel && (
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Training Level</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.trainingLevel.toLowerCase()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Temperature Unit</p>
                <p className="text-xs text-muted-foreground">
                  Choose how temperature is displayed
                </p>
              </div>
            </div>
            <Select
              value={currentTemperatureUnit}
              onValueChange={(value) => {
                updateTemperatureUnit.mutate({
                  temperatureUnit: value as 'FAHRENHEIT' | 'CELSIUS',
                });
              }}
              disabled={updateTemperatureUnit.isPending}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAHRENHEIT">Fahrenheit (°F)</SelectItem>
                <SelectItem value="CELSIUS">Celsius (°C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
