"use strict";
/**
 * @fileoverview Reschedule option card component - displays a single AI-generated reschedule option
 * @module components/flights/reschedule-option-card
 */
'use client';
/**
 * @fileoverview Reschedule option card component - displays a single AI-generated reschedule option
 * @module components/flights/reschedule-option-card
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleOptionCard = RescheduleOptionCard;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
/**
 * Displays a single reschedule option with weather forecast and reasoning
 *
 * @param props - Component props
 * @returns Rendered option card
 */
function RescheduleOptionCard({ option, onSelect, isLoading = false, }) {
    const suggestedDate = new Date(option.suggestedDate);
    const weather = option.weatherSummary;
    return (<card_1.Card className="relative">
      <card_1.CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <card_1.CardTitle className="text-lg">
              {(0, date_fns_1.format)(suggestedDate, 'MMM dd, yyyy')}
            </card_1.CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {(0, date_fns_1.format)(suggestedDate, 'h:mm a')} • {option.suggestedDuration}h duration
            </p>
          </div>
          <badge_1.Badge variant={option.confidenceScore >= 70 ? 'success' : 'warning'}>
            {option.confidenceScore}% confidence
          </badge_1.Badge>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {/* Weather Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <lucide_react_1.Thermometer className="h-4 w-4 text-muted-foreground"/>
              <span>{weather.temperature}°F</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <lucide_react_1.Wind className="h-4 w-4 text-muted-foreground"/>
              <span>{weather.windSpeed} kt</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <lucide_react_1.Eye className="h-4 w-4 text-muted-foreground"/>
              <span>{weather.visibility} mi</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <lucide_react_1.Cloud className="h-4 w-4 text-muted-foreground"/>
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
          <button_1.Button onClick={() => onSelect(option)} disabled={isLoading} className="w-full" variant="default">
            {isLoading ? 'Processing...' : 'Select This Option'}
          </button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
