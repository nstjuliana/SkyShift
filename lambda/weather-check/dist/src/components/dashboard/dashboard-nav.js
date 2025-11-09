"use strict";
/**
 * @fileoverview Dashboard navigation component
 * @module components/dashboard/dashboard-nav
 */
'use client';
/**
 * @fileoverview Dashboard navigation component
 * @module components/dashboard/dashboard-nav
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardNav = DashboardNav;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
/**
 * Navigation items configuration
 */
const navItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: lucide_react_1.LayoutDashboard,
    },
    {
        href: '/dashboard/flights',
        label: 'Flights',
        icon: lucide_react_1.Plane,
    },
    {
        href: '/dashboard/analytics',
        label: 'Analytics',
        icon: lucide_react_1.BarChart3,
    },
    {
        href: '/dashboard/profile',
        label: 'Profile',
        icon: lucide_react_1.User,
    },
];
/**
 * Dashboard navigation component
 *
 * Displays navigation links with active state highlighting
 *
 * @returns Rendered navigation sidebar
 */
function DashboardNav() {
    const pathname = (0, navigation_1.usePathname)();
    return (<nav className="w-64 border-r bg-card p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (<li key={item.href}>
              <link_1.default href={item.href} className={(0, utils_1.cn)('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                <Icon className="h-4 w-4"/>
                {item.label}
              </link_1.default>
            </li>);
        })}
      </ul>
    </nav>);
}
