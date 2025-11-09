/**
 * @fileoverview Reschedule option card component - displays a single AI-generated reschedule option
 * @module components/flights/reschedule-option-card
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Cloud, Wind, Eye, Thermometer } from 'lucide-react';
import type { RescheduleOption } from '@/types/reschedule';

/**
 * Props for RescheduleOptionCard component
 */
interface RescheduleOptionCardProps {
  /** Reschedule option data */
  option: RescheduleOption;
  /** Callback when option is selected */
  onSelect: (option: RescheduleOption) => void;
  /** Whether the option is being processed */
  isLoading?: boolean;
}

/**
 * Displays a single reschedule option with weather forecast and reasoning
 * 
 * @param props - Component props
 * @returns Rendered option card
 */
export function RescheduleOptionCard({
  option,
  onSelect,
  isLoading = false,
}: RescheduleOptionCardProps) {
  const suggestedDate = new Date(option.suggestedDate);
  const weather = option.weatherSummary;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {format(suggestedDate, 'MMM dd, yyyy')}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(suggestedDate, 'h:mm a')} • {option.suggestedDuration}h duration
            </p>
          </div>
          <Badge variant={option.confidenceScore >= 70 ? 'success' : 'warning'}>
            {option.confidenceScore}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Weather Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span>{weather.temperature}°F</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{weather.windSpeed} kt</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{weather.visibility} mi</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              <span>{weather.conditions}</span>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Why this option:</strong> {option.reasoning}
            </p>
          </div>

          {/* Select Button */}
          <Button
            onClick={() => onSelect(option)}
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            {isLoading ? 'Processing...' : 'Select This Option'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

