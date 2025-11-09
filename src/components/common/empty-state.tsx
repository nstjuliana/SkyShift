/**
 * @fileoverview Empty state component for when no data is available
 * @module components/common/empty-state
 */

import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Empty state component
 * 
 * Displays a message when there's no data to show
 * 
 * @param props - Component props
 * @returns Rendered empty state
 * 
 * @example
 * ```tsx
 * <EmptyState 
 *   title="No flights found"
 *   description="Create your first flight booking to get started"
 *   action={<Button>Create Flight</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

