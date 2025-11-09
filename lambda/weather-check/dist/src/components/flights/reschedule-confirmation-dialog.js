"use strict";
/**
 * @fileoverview Reschedule confirmation dialog - confirms option selection before submission
 * @module components/flights/reschedule-confirmation-dialog
 */
'use client';
/**
 * @fileoverview Reschedule confirmation dialog - confirms option selection before submission
 * @module components/flights/reschedule-confirmation-dialog
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleConfirmationDialog = RescheduleConfirmationDialog;
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const date_fns_1 = require("date-fns");
/**
 * Confirmation dialog for reschedule option selection
 *
 * @param props - Component props
 * @returns Rendered confirmation dialog
 */
function RescheduleConfirmationDialog({ open, onClose, originalDate, selectedOption, onConfirm, isLoading = false, }) {
    if (!selectedOption) {
        return null;
    }
    const newDate = new Date(selectedOption.suggestedDate);
    return (<dialog_1.Dialog open={open} onOpenChange={onClose}>
      <dialog_1.DialogContent>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Confirm Reschedule</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Please review the reschedule details below. Your instructor will need to approve this change.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <p className="text-sm font-medium">Original Date</p>
                <p className="text-sm text-muted-foreground">
                  {(0, date_fns_1.format)(originalDate, 'MMM dd, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center text-muted-foreground">
              ↓
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border-2 border-primary">
              <div>
                <p className="text-sm font-medium">New Date</p>
                <p className="text-sm text-muted-foreground">
                  {(0, date_fns_1.format)(newDate, 'MMM dd, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Reason:</strong> {selectedOption.reasoning}
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              After you confirm, your instructor will receive a notification to approve this reschedule.
            </p>
          </div>
        </div>
        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </button_1.Button>
          <button_1.Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm Reschedule'}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
