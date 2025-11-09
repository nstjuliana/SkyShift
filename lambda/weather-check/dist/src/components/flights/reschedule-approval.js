"use strict";
/**
 * @fileoverview Reschedule approval component for instructors
 * @module components/flights/reschedule-approval
 */
'use client';
/**
 * @fileoverview Reschedule approval component for instructors
 * @module components/flights/reschedule-approval
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RescheduleApproval = RescheduleApproval;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const dialog_1 = require("@/components/ui/dialog");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const date_fns_1 = require("date-fns");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
/**
 * Component for instructors to approve or reject reschedule requests
 *
 * @param props - Component props
 * @returns Rendered approval component
 */
function RescheduleApproval({ reschedule, onApprove, onReject, isLoading = false, }) {
    const [showDialog, setShowDialog] = (0, react_1.useState)(false);
    const [rejectionReason, setRejectionReason] = (0, react_1.useState)('');
    const [isRejecting, setIsRejecting] = (0, react_1.useState)(false);
    const handleReject = () => {
        if (!rejectionReason.trim()) {
            return;
        }
        setIsRejecting(true);
        onReject(reschedule.id, rejectionReason);
    };
    return (<>
      <card_1.Card className="border-blue-500 border-2">
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5 text-blue-600"/>
              <card_1.CardTitle className="text-blue-600">Pending Reschedule Request</card_1.CardTitle>
            </div>
            <badge_1.Badge variant="outline">Awaiting Your Approval</badge_1.Badge>
          </div>
          <card_1.CardDescription>
            {reschedule.booking.student.name || 'Student'} has requested to reschedule this flight
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Original Date</p>
              <p className="text-sm text-muted-foreground">
                {(0, date_fns_1.format)(new Date(reschedule.booking.scheduledDate), 'MMM dd, yyyy h:mm a')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Duration: {reschedule.booking.duration}h
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-md border-2 border-primary">
              <p className="text-sm font-medium mb-1">Proposed Date</p>
              <p className="text-sm font-semibold text-primary">
                {(0, date_fns_1.format)(new Date(reschedule.proposedDate), 'MMM dd, yyyy h:mm a')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Duration: {reschedule.proposedDuration}h
              </p>
            </div>
          </div>

          {reschedule.aiReasoning && (<div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">AI Reasoning</p>
              <p className="text-sm text-muted-foreground">{reschedule.aiReasoning}</p>
            </div>)}

          {reschedule.weatherForecast && (<div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Expected Weather</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Temp: </span>
                  <span>{reschedule.weatherForecast.temperature}°F</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Wind: </span>
                  <span>{reschedule.weatherForecast.windSpeed} kt</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Visibility: </span>
                  <span>{reschedule.weatherForecast.visibility} mi</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Conditions: </span>
                  <span>{reschedule.weatherForecast.conditions}</span>
                </div>
              </div>
            </div>)}

          <div className="flex gap-2 pt-2">
            <button_1.Button onClick={() => onApprove(reschedule.id)} disabled={isLoading} className="flex-1" variant="default">
              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2"/>
              Approve
            </button_1.Button>
            <button_1.Button onClick={() => setShowDialog(true)} disabled={isLoading} className="flex-1" variant="destructive">
              <lucide_react_1.XCircle className="h-4 w-4 mr-2"/>
              Reject
            </button_1.Button>
          </div>

          {reschedule.studentConfirmedAt && (<p className="text-xs text-muted-foreground text-center">
              Student confirmed on {(0, date_fns_1.format)(new Date(reschedule.studentConfirmedAt), 'MMM dd, h:mm a')}
            </p>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Rejection Dialog */}
      <dialog_1.Dialog open={showDialog} onOpenChange={setShowDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Reject Reschedule Request</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Please provide a reason for rejecting this reschedule request. The student will be notified.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label_1.Label htmlFor="rejection-reason">Rejection Reason</label_1.Label>
              <textarea_1.Textarea id="rejection-reason" placeholder="e.g., I'm not available at that time, or Please choose a different date..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mt-2" rows={3}/>
            </div>
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={() => setShowDialog(false)} disabled={isRejecting}>
              Cancel
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || isRejecting}>
              {isRejecting ? 'Rejecting...' : 'Reject Request'}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </>);
}
