"use strict";
/**
 * @fileoverview Dashboard weather actions component
 * @module components/dashboard/dashboard-weather-actions
 */
'use client';
/**
 * @fileoverview Dashboard weather actions component
 * @module components/dashboard/dashboard-weather-actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardWeatherActions = DashboardWeatherActions;
const button_1 = require("@/components/ui/button");
const trpc_1 = require("@/lib/trpc");
const use_toast_1 = require("@/hooks/use-toast");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
/**
 * Dashboard weather actions component
 * Provides buttons to manually trigger weather checks
 *
 * @returns Rendered weather actions
 */
function DashboardWeatherActions() {
    const { toast } = (0, use_toast_1.useToast)();
    const [isChecking, setIsChecking] = (0, react_1.useState)(false);
    const checkAllFlights = trpc_1.trpc.weather.checkAllFlights.useMutation({
        onSuccess: (data) => {
            toast({
                title: 'Weather check complete',
                description: `Checked ${data.checked} flights. ${data.atRisk} flights at risk.`,
            });
            setIsChecking(false);
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to check weather',
                variant: 'destructive',
            });
            setIsChecking(false);
        },
    });
    const handleCheckWeather = () => {
        setIsChecking(true);
        checkAllFlights.mutate();
    };
    return (<button_1.Button onClick={handleCheckWeather} disabled={isChecking} variant="outline">
      <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`}/>
      {isChecking ? 'Checking...' : 'Check All Weather'}
    </button_1.Button>);
}
