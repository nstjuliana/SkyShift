"use strict";
/**
 * @fileoverview Empty state component for when no data is available
 * @module components/common/empty-state
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyState = EmptyState;
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
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
function EmptyState({ title, description, action, className, }) {
    return (<div className={(0, utils_1.cn)('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <lucide_react_1.Inbox className="h-12 w-12 text-muted-foreground mb-4"/>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (<p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>)}
      {action && <div className="mt-4">{action}</div>}
    </div>);
}
