"use strict";
/**
 * @fileoverview User profile page
 * @module app/(dashboard)/dashboard/profile/page
 */
'use client';
/**
 * @fileoverview User profile page
 * @module app/(dashboard)/dashboard/profile/page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const react_1 = require("next-auth/react");
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const trpc_1 = require("@/lib/trpc");
const select_1 = require("@/components/ui/select");
const use_toast_1 = require("@/hooks/use-toast");
/**
 * User profile page component
 *
 * @returns Rendered profile page
 */
function ProfilePage() {
    const { data: session, update: updateSession } = (0, react_1.useSession)();
    const { toast } = (0, use_toast_1.useToast)();
    const { data: profile, refetch } = trpc_1.trpc.users.getProfile.useQuery(undefined, {
        enabled: !!session?.user,
    });
    const updateTemperatureUnit = trpc_1.trpc.users.updateTemperatureUnit.useMutation({
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
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your account information
        </p>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Account Information</card_1.CardTitle>
          <card_1.CardDescription>Your personal account details</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <lucide_react_1.User className="h-5 w-5 text-muted-foreground"/>
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {user.name || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <lucide_react_1.Mail className="h-5 w-5 text-muted-foreground"/>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <lucide_react_1.Shield className="h-5 w-5 text-muted-foreground"/>
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>

          {user.trainingLevel && (<div className="flex items-center gap-3">
              <lucide_react_1.GraduationCap className="h-5 w-5 text-muted-foreground"/>
              <div>
                <p className="text-sm font-medium">Training Level</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.trainingLevel.toLowerCase()}
                </p>
              </div>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Preferences</card_1.CardTitle>
          <card_1.CardDescription>Manage your account preferences</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <lucide_react_1.Thermometer className="h-5 w-5 text-muted-foreground"/>
              <div>
                <p className="text-sm font-medium">Temperature Unit</p>
                <p className="text-xs text-muted-foreground">
                  Choose how temperature is displayed
                </p>
              </div>
            </div>
            <select_1.Select value={currentTemperatureUnit} onValueChange={(value) => {
            updateTemperatureUnit.mutate({
                temperatureUnit: value,
            });
        }} disabled={updateTemperatureUnit.isPending}>
              <select_1.SelectTrigger className="w-[140px]">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="FAHRENHEIT">Fahrenheit (°F)</select_1.SelectItem>
                <select_1.SelectItem value="CELSIUS">Celsius (°C)</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
