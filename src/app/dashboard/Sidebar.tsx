"use client";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { formatLogoutError } from "@/utils/formatLogoutError";
import { useNotificationStore } from "@/store/useNotificationStore";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import {
	Menu, LogOut, Settings,
	LayoutDashboard, TrendingUp, PiggyBank, Receipt,
	Wallet, User, History,
	type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_ITEMS: NavItem[] = [
	{ href: "/dashboard/overview", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/dashboard/income",   label: "Income",    icon: TrendingUp      },
	{ href: "/dashboard/budget",   label: "Budget",    icon: PiggyBank       },
	{ href: "/dashboard/expenses", label: "Expenses",  icon: Receipt         },
];

const COMING_SOON: { label: string; icon: LucideIcon }[] = [
	{ label: "Savings", icon: Wallet  },
	{ label: "Profile", icon: User    },
	{ label: "History", icon: History },
];

// Section label inside the nav — muted but still ≥4.5:1 on both surfaces.
const sectionLabelClass =
	"mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400";

const navLinkClass = (active: boolean) =>
	`flex flex-row items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
		active
			? "bg-brand-500 text-white"
			: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-dark-overlay dark:hover:text-zinc-100"
	}`;

const Sidebar = () => {
	const router   = useRouter();
	const pathname = usePathname();
	const { close } = useNotificationStore();
	const [isMoreOpen, setIsMoreOpen] = useState(false);

	const isActive = (href: string) =>
		pathname === href || (href === "/dashboard/overview" && pathname === "/dashboard");

	const logout = async () => {
		try {
			await signOut(auth);
			router.push("/");
		} catch (err) {
			toast.error(formatLogoutError(err));
		}
	};

	return (
		<>
			{/* ── Desktop sidebar ── */}
			<nav
				aria-label="Primary"
				className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-60
			                lg:border-r lg:border-zinc-200/80 lg:bg-white
			                dark:lg:border-dark-border dark:lg:bg-dark-surface
			                lg:pt-20 lg:pb-6 lg:px-3 lg:gap-1 lg:z-20"
			>
				<p className={sectionLabelClass}>Overview</p>

				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const active = isActive(href);
					return (
						<Link
							key={href}
							href={href}
							onClick={close}
							aria-current={active ? "page" : undefined}
							className={navLinkClass(active)}
						>
							<Icon className="h-4 w-4 shrink-0" aria-hidden />
							<span className="text-sm font-medium">{label}</span>
						</Link>
					);
				})}

				{COMING_SOON.map(({ label, icon: Icon }) => (
					<button
						key={label}
						type="button"
						onClick={() => toast(`${label} feature is coming soon!`)}
						className="flex flex-row items-center gap-3 rounded-xl px-3 py-2.5 text-left
						           text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-dark-overlay/50
						           transition-all duration-150"
					>
						<Icon className="h-4 w-4 shrink-0" aria-hidden />
						<span className="text-sm font-medium">{label}</span>
						<span className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600
						                 dark:bg-dark-overlay dark:text-zinc-400">
							Soon
						</span>
					</button>
				))}

				<div className="mt-auto flex flex-col gap-1 border-t border-zinc-100 pt-4 dark:border-dark-border">
					<p className={sectionLabelClass}>Other</p>
					<Link
						href="/dashboard/settings"
						onClick={close}
						aria-current={isActive("/dashboard/settings") ? "page" : undefined}
						className={navLinkClass(isActive("/dashboard/settings"))}
					>
						<Settings className="h-4 w-4 shrink-0" aria-hidden />
						<span className="text-sm font-medium">Settings</span>
					</Link>

					<button
						type="button"
						onClick={logout}
						className="flex flex-row items-center gap-3 rounded-xl px-3 py-2.5
						           text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10
						           transition-all duration-150"
					>
						<LogOut className="h-4 w-4 shrink-0" aria-hidden />
						<span className="text-sm font-medium">Logout</span>
					</button>
				</div>
			</nav>

			{/* ── Mobile bottom bar ── */}
			<nav
				aria-label="Primary"
				className="lg:hidden fixed bottom-0 left-0 right-0 z-40
			                border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl px-2 py-1
			                dark:border-dark-border dark:bg-dark-surface/95"
			>
				<div className="flex flex-row items-center justify-around">
					{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
						const active = isActive(href);
						return (
							<Link
								key={href}
								href={href}
								onClick={close}
								aria-current={active ? "page" : undefined}
								className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-all
								           ${active ? "text-brand-500 dark:text-green-400" : "text-zinc-500 dark:text-zinc-400"}`}
							>
								<Icon className="h-5 w-5" aria-hidden />
								<span className="text-[11px] font-semibold">{label}</span>
							</Link>
						);
					})}

					<button
						type="button"
						className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-zinc-500 dark:text-zinc-400"
						onClick={() => setIsMoreOpen(true)}
						aria-label="Open menu"
						aria-haspopup="dialog"
						aria-expanded={isMoreOpen}
					>
						<Menu className="h-5 w-5" aria-hidden />
						<span className="text-[11px] font-semibold">More</span>
					</button>
				</div>
			</nav>

			{/* ── Mobile More sheet ── */}
			<AccessibleDialog
				open={isMoreOpen}
				onClose={() => setIsMoreOpen(false)}
				title="Menu"
				titleId="mobile-menu-title"
				variant="sheet"
				className="lg:hidden"
			>
				<div className="mb-3">
					<p className={`${sectionLabelClass} px-0`}>Navigate</p>
					<div className="grid grid-cols-2 gap-2">
						{NAV_ITEMS.map(({ href, label, icon: Icon }) => (
							<Link
								key={href}
								href={href}
								onClick={() => { setIsMoreOpen(false); close(); }}
								aria-current={isActive(href) ? "page" : undefined}
								className="flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 p-3
								           text-sm font-medium text-zinc-800 hover:bg-zinc-50
								           dark:border-dark-border dark:text-zinc-200 dark:hover:bg-dark-overlay"
							>
								<Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
								{label}
							</Link>
						))}
					</div>
				</div>

				<div className="mb-4">
					<p className={`${sectionLabelClass} px-0`}>Coming soon</p>
					<div className="flex flex-wrap gap-2">
						{COMING_SOON.map(({ label, icon: Icon }) => (
							<button
								key={label}
								type="button"
								onClick={() => { setIsMoreOpen(false); toast(`${label} feature is coming soon!`); }}
								className="flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2
								           text-sm font-medium text-zinc-600 dark:border-dark-border dark:text-zinc-400"
							>
								<Icon className="h-4 w-4" aria-hidden />
								{label}
								<span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-600
								                 dark:bg-dark-overlay dark:text-zinc-400">
									Soon
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="border-t border-zinc-100 pt-3 dark:border-dark-border flex flex-col gap-2">
					<Link
						href="/dashboard/settings"
						onClick={() => setIsMoreOpen(false)}
						className="flex min-h-11 items-center gap-3 rounded-xl border border-zinc-200 p-3 text-sm font-medium
						           text-zinc-800 hover:bg-zinc-50 dark:border-dark-border dark:text-zinc-200 dark:hover:bg-dark-overlay"
					>
						<Settings className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
						Settings
					</Link>
					<button
						type="button"
						onClick={() => { setIsMoreOpen(false); logout(); }}
						className="btn-danger min-h-11 w-full"
					>
						<LogOut className="h-4 w-4" aria-hidden />
						Logout
					</button>
				</div>
			</AccessibleDialog>
		</>
	);
};

export default Sidebar;
