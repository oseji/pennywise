"use client";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { formatLogoutError } from "@/utils/formatLogoutError";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
	Menu, LogOut, Settings, X,
	LayoutDashboard, TrendingUp, PiggyBank, Receipt,
	Wallet, User, History,
} from "lucide-react";

import dashboardIcon from "../../assets/sidebar/dashboard.svg";
import incomeIcon     from "../../assets/sidebar/income.svg";
import budgetIcon     from "../../assets/sidebar/budget.svg";
import expensesIcon   from "../../assets/sidebar/expenses.svg";
import savingsIcon    from "../../assets/sidebar/savings.svg";
import profileIcon    from "../../assets/sidebar/profile.svg";
import historyIcon    from "../../assets/sidebar/history.svg";
import settingsIcon   from "../../assets/sidebar/settings.svg";
import logoutIcon     from "../../assets/sidebar/logout.svg";

const NAV_ITEMS = [
	{ href: "/dashboard/overview", label: "Dashboard",  icon: dashboardIcon,  lucide: LayoutDashboard },
	{ href: "/dashboard/income",   label: "Income",     icon: incomeIcon,     lucide: TrendingUp      },
	{ href: "/dashboard/budget",   label: "Budget",     icon: budgetIcon,     lucide: PiggyBank       },
	{ href: "/dashboard/expenses", label: "Expenses",   icon: expensesIcon,   lucide: Receipt         },
];

const COMING_SOON = [
	{ label: "Savings", icon: savingsIcon,  lucide: Wallet  },
	{ label: "Profile", icon: profileIcon,  lucide: User    },
	{ label: "History", icon: historyIcon,  lucide: History },
];

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
			<nav className="hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-60
			                lg:border-r lg:border-zinc-200/80 lg:bg-white
			                dark:lg:border-dark-border dark:lg:bg-dark-surface
			                lg:pt-20 lg:pb-6 lg:px-3 lg:gap-1 lg:z-20">

				<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
					Overview
				</p>

				{NAV_ITEMS.map(({ href, label, icon }) => {
					const active = isActive(href);
					return (
						<Link
							key={href}
							href={href}
							onClick={close}
							className={`flex flex-row items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150
							           ${active
							               ? "bg-brand-500 text-white shadow-glow-green"
							               : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-dark-overlay dark:hover:text-zinc-100"
							           }`}
						>
							<Image src={icon} alt="" className={`h-4 w-4 ${active ? "brightness-0 invert" : "opacity-70 dark:invert dark:opacity-50"}`} />
							<span className="text-sm font-medium capitalize">{label}</span>
						</Link>
					);
				})}

				{COMING_SOON.map(({ label, icon }) => (
					<button
						key={label}
						type="button"
						onClick={() => toast(`${label} feature is coming soon!`)}
						className="flex flex-row items-center gap-3 rounded-xl px-3 py-2.5 text-left
						           text-zinc-400 hover:bg-zinc-50 dark:text-zinc-600 dark:hover:bg-dark-overlay/50
						           transition-all duration-150"
					>
						<Image src={icon} alt="" className="h-4 w-4 opacity-40 dark:invert dark:opacity-30" />
						<span className="text-sm font-medium capitalize">{label}</span>
						<span className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400
						                 dark:bg-dark-overlay dark:text-zinc-600">
							Soon
						</span>
					</button>
				))}

				<div className="mt-auto flex flex-col gap-1 border-t border-zinc-100 pt-4 dark:border-dark-border">
					<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
						Other
					</p>
					<Link
						href="/dashboard/settings"
						onClick={close}
						className={`flex flex-row items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150
						           ${isActive("/dashboard/settings")
						               ? "bg-brand-500 text-white shadow-glow-green"
						               : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-dark-overlay dark:hover:text-zinc-100"
						           }`}
					>
						<Image src={settingsIcon} alt="" className={`h-4 w-4 ${isActive("/dashboard/settings") ? "brightness-0 invert" : "opacity-70 dark:invert dark:opacity-50"}`} />
						<span className="text-sm font-medium capitalize">Settings</span>
					</Link>

					<button
						type="button"
						onClick={logout}
						className="flex flex-row items-center gap-3 rounded-xl px-3 py-2.5
						           text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10
						           transition-all duration-150"
					>
						<Image src={logoutIcon} alt="" className="h-4 w-4 opacity-70" />
						<span className="text-sm font-medium capitalize">Logout</span>
					</button>
				</div>
			</nav>

			{/* ── Mobile bottom bar ── */}
			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-40
			                border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl px-2 py-2
			                dark:border-dark-border dark:bg-dark-surface/95">
				<div className="flex flex-row items-center justify-around">
					{NAV_ITEMS.map(({ href, label, icon }) => {
						const active = isActive(href);
						return (
							<Link
								key={href}
								href={href}
								onClick={close}
								className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all
								           ${active ? "text-brand-500 dark:text-green-400" : "text-zinc-400 dark:text-zinc-600"}`}
							>
								<Image
									src={icon}
									alt=""
									className={`h-5 w-5 transition-all ${
										active
											? "opacity-100 dark:invert dark:hue-rotate-[40deg]"
											: "opacity-40 dark:invert dark:opacity-30"
									}`}
								/>
								<span className={`text-[10px] font-semibold capitalize ${active ? "" : ""}`}>
									{label}
								</span>
							</Link>
						);
					})}

					<button
						type="button"
						className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-zinc-400 dark:text-zinc-600"
						onClick={() => setIsMoreOpen(true)}
						aria-label="Open menu"
					>
						<Menu className="h-5 w-5" />
						<span className="text-[10px] font-semibold">More</span>
					</button>
				</div>
			</div>

			{/* ── Mobile More sheet ── */}
			<div
				className={`fixed inset-0 z-50 lg:hidden ${isMoreOpen ? "flex" : "hidden"} items-end justify-center`}
				role="presentation"
			>
				<button
					type="button"
					className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					aria-label="Close menu"
					onClick={() => setIsMoreOpen(false)}
				/>
				<div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl
				                dark:bg-dark-raised border-t border-zinc-200/80 dark:border-dark-border">
					<div className="mb-1 flex h-1 w-12 mx-auto rounded-full bg-zinc-200 dark:bg-dark-border" />

					<div className="mt-4 flex flex-row items-center justify-between mb-4">
						<p className="font-bold text-zinc-900 dark:text-zinc-50">Menu</p>
						<button
							type="button"
							onClick={() => setIsMoreOpen(false)}
							className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-dark-overlay"
							aria-label="Close menu"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="mb-3">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
							Navigate
						</p>
						<div className="grid grid-cols-2 gap-2">
							{NAV_ITEMS.map(({ href, label }) => (
								<Link
									key={href}
									href={href}
									onClick={() => { setIsMoreOpen(false); close(); }}
									className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3
									           text-sm font-medium text-zinc-800 hover:bg-zinc-50
									           dark:border-dark-border dark:text-zinc-200 dark:hover:bg-dark-overlay"
								>
									{label}
								</Link>
							))}
						</div>
					</div>

					<div className="mb-4">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
							Coming soon
						</p>
						<div className="flex gap-2">
							{COMING_SOON.map(({ label }) => (
								<button
									key={label}
									type="button"
									onClick={() => { setIsMoreOpen(false); toast(`${label} feature is coming soon!`); }}
									className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5
									           text-sm font-medium text-zinc-500 dark:border-dark-border dark:text-zinc-500"
								>
									{label}
									<span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400
									                 dark:bg-dark-overlay dark:text-zinc-600">
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
							className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 text-sm font-medium
							           text-zinc-800 hover:bg-zinc-50 dark:border-dark-border dark:text-zinc-200 dark:hover:bg-dark-overlay"
						>
							<Settings className="h-4 w-4" />
							Settings
						</Link>
						<button
							type="button"
							onClick={() => { setIsMoreOpen(false); logout(); }}
							className="flex items-center gap-3 rounded-xl bg-red-500 p-3 text-sm font-semibold text-white
							           hover:bg-red-600 transition"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default Sidebar;
