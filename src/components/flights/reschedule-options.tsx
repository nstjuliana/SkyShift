/**
 * @fileoverview Reschedule options container - displays 3 AI-generated reschedule options
 * @module components/flights/reschedule-options
 */

'use client';

import { RescheduleOptionCard } from './reschedule-option-card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ErrorMessage } from '@/components/common/error-message';
import type { RescheduleOption } from '@/types/reschedule';

/**
 * Props for RescheduleOptions component
 */
interface RescheduleOptionsProps {
  /** Array of reschedule options */
  options?: RescheduleOption[];
  /** Whether options are being generated */
  isLoading?: boolean;
  /** Error message if generation failed */
  error?: string | null;
  /** Callback when an option is selected */
  onSelectOption: (option: RescheduleOption) => void;
  /** Whether an option is being processed */
  isProcessing?: boolean;
}

/**
 * Container component for displaying AI-generated reschedule options
 * 
 * @param props - Component props
 * @returns Rendered options container
 */
export function RescheduleOptions({
  options,
  isLoading = false,
  error = null,
  onSelectOption,
  isProcessing = false,
}: RescheduleOptionsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-muted-foreground">
          Generating AI reschedule options...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to generate options"
        message={error}
      />
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reschedule options available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI-Generated Reschedule Options</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select one of the options below. Your instructor will need to approve the reschedule.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option, index) => (
          <RescheduleOptionCard
            key={index}
            option={option}
            onSelect={onSelectOption}
            isLoading={isProcessing}
          />
        ))}
      </div>
    </div>
  );
}

