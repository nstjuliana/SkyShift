"use strict";
/**
 * @fileoverview Reschedule options container - displays 3 AI-generated reschedule options
 * @module components/flights/reschedule-options
 */
'use client';
/**
 * @fileoverview Reschedule options container - displays 3 AI-generated reschedule options
 * @module components/flights/reschedule-options
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleOptions = RescheduleOptions;
const reschedule_option_card_1 = require("./reschedule-option-card");
const loading_spinner_1 = require("@/components/common/loading-spinner");
const error_message_1 = require("@/components/common/error-message");
/**
 * Container component for displaying AI-generated reschedule options
 *
 * @param props - Component props
 * @returns Rendered options container
 */
function RescheduleOptions({ options, isLoading = false, error = null, onSelectOption, isProcessing = false, }) {
    if (isLoading) {
        return (<div className="flex flex-col items-center justify-center py-12">
        <loading_spinner_1.LoadingSpinner />
        <p className="mt-4 text-sm text-muted-foreground">
          Generating AI reschedule options...
        </p>
      </div>);
    }
    if (error) {
        return (<error_message_1.ErrorMessage title="Failed to generate options" message={error}/>);
    }
    if (!options || options.length === 0) {
        return (<div className="text-center py-8 text-muted-foreground">
        <p>No reschedule options available.</p>
      </div>);
    }
    return (<div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI-Generated Reschedule Options</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select one of the options below. Your instructor will need to approve the reschedule.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option, index) => (<reschedule_option_card_1.RescheduleOptionCard key={index} option={option} onSelect={onSelectOption} isLoading={isProcessing}/>))}
      </div>
    </div>);
}
