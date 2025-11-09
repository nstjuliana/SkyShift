/**
 * @fileoverview Reschedule confirmation dialog - confirms option selection before submission
 * @module components/flights/reschedule-confirmation-dialog
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { RescheduleOption } from '@/types/reschedule';

/**
 * Props for RescheduleConfirmationDialog component
 */
interface RescheduleConfirmationDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Original booking date */
  originalDate: Date;
  /** Selected reschedule option */
  selectedOption: RescheduleOption | null;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Whether confirmation is being processed */
  isLoading?: boolean;
}

/**
 * Confirmation dialog for reschedule option selection
 * 
 * @param props - Component props
 * @returns Rendered confirmation dialog
 */
export function RescheduleConfirmationDialog({
  open,
  onClose,
  originalDate,
  selectedOption,
  onConfirm,
  isLoading = false,
}: RescheduleConfirmationDialogProps) {
  if (!selectedOption) {
    return null;
  }

  const newDate = new Date(selectedOption.suggestedDate);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Reschedule</DialogTitle>
          <DialogDescription>
            Please review the reschedule details below. Your instructor will need to approve this change.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <p className="text-sm font-medium">Original Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(originalDate, 'MMM dd, yyyy h:mm a')}
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
                  {format(newDate, 'MMM dd, yyyy h:mm a')}
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

