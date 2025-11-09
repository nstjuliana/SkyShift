/**
 * @fileoverview Error message component for displaying errors
 * @module components/common/error-message
 */

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for ErrorMessage component
 */
interface ErrorMessageProps {
  /** Error message text */
  message: string;
  /** Optional title */
  title?: string;
  /** Optional retry action */
  onRetry?: () => void;
  /** Optional CSS class name */
  className?: string;
}

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
export function ErrorMessage({
  message,
  title = 'Error',
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/50 bg-destructive/10 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-destructive mb-1">{title}</h4>
          <p className="text-sm text-destructive/90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-destructive hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

