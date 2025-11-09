/**
 * @fileoverview Loading spinner component for async operations
 * @module components/common/loading-spinner
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Size of the spinner (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Optional CSS class name */
  className?: string;
  /** Optional text to display below spinner */
  text?: string;
}

/**
 * Loading spinner component
 * 
 * Displays an animated spinner for loading states
 * 
 * @param props - Component props
 * @returns Rendered loading spinner
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading flights..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

