import {
	ArrowDownLeft,
	ArrowUpRight,
	Gauge,
	LayoutDashboard,
	PiggyBank,
	ScrollText,
	Settings2,
	type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const PRIMARY_NAV: NavItem[] = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/dashboard/income", label: "Income", icon: ArrowDownLeft },
	{ href: "/dashboard/budget", label: "Budget", icon: Gauge },
	{ href: "/dashboard/expenses", label: "Expenses", icon: ArrowUpRight },
];

export const RECORDS_NAV: NavItem[] = [{ href: "/dashboard/history", label: "History", icon: ScrollText }];

export const SAVINGS_ITEM: NavItem = { href: "/dashboard/savings", label: "Savings", icon: PiggyBank };
export const SETTINGS_ITEM: NavItem = { href: "/dashboard/settings", label: "Settings", icon: Settings2 };

export const isActivePath = (pathname: string, href: string) =>
	href === "/dashboard"
		? pathname === "/dashboard" || pathname === "/dashboard/overview"
		: pathname === href || pathname.startsWith(`${href}/`);
