"use strict";
/**
 * @fileoverview Utility functions for className merging
 * @module lib/utils
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
/**
 * Merge Tailwind CSS classes with conflict resolution
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4'
 * ```
 */
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
