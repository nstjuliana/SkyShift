"use strict";
/**
 * @fileoverview Loading spinner component for async operations
 * @module components/common/loading-spinner
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = LoadingSpinner;
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
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
function LoadingSpinner({ size = 'md', className, text, }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };
    return (<div className={(0, utils_1.cn)('flex flex-col items-center justify-center gap-2', className)}>
      <lucide_react_1.Loader2 className={(0, utils_1.cn)('animate-spin text-primary', sizeClasses[size])}/>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>);
}
