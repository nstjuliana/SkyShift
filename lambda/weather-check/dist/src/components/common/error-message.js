"use strict";
/**
 * @fileoverview Error message component for displaying errors
 * @module components/common/error-message
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessage = ErrorMessage;
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
/**
 * Error message component
 *
 * Displays error messages with optional retry action
 *
 * @param props - Component props
 * @returns Rendered error message
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="Failed to load flights"
 *   message="Unable to connect to the server"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
function ErrorMessage({ message, title = 'Error', onRetry, className, }) {
    return (<div className={(0, utils_1.cn)('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}>
      <div className="flex items-start gap-3">
        <lucide_react_1.AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"/>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-destructive mb-1">{title}</h4>
          <p className="text-sm text-destructive/90">{message}</p>
          {onRetry && (<button onClick={onRetry} className="mt-3 text-sm font-medium text-destructive hover:underline">
              Try again
            </button>)}
        </div>
      </div>
    </div>);
}
