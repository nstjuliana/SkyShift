/**
 * @fileoverview Dashboard weather actions component
 * @module components/dashboard/dashboard-weather-actions
 */

'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

/**
 * Dashboard weather actions component
 * Provides buttons to manually trigger weather checks
 * 
 * @returns Rendered weather actions
 */
export function DashboardWeatherActions() {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const checkAllFlights = trpc.weather.checkAllFlights.useMutation({
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

  return (
    <Button
      onClick={handleCheckWeather}
      disabled={isChecking}
      variant="outline"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
      {isChecking ? 'Checking...' : 'Check All Weather'}
    </Button>
  );
}

