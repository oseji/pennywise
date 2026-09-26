"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUiStore } from "@/store/useUiStore";
import { PRIMARY_NAV, RECORDS_NAV, SAVINGS_ITEM, SETTINGS_ITEM, isActivePath, type NavItem } from "./nav";
import { useLogout } from "./useLogout";

const rowBase =
	"relative flex min-h-11 items-center gap-3 rounded-[8px] px-3 font-mono text-[12.5px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150";

function RailLink({ item, active, soon }: { item: NavItem; active: boolean; soon?: boolean }) {
	const close = useNotificationStore((s) => s.close);
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			onClick={close}
			aria-current={active ? "page" : undefined}
			className={`${rowBase} ${active ? "text-term" : "text-term-ink-2 hover:bg-term-2 hover:text-term-ink"}`}
		>
			{active && (
				<motion.span
					layoutId="rail-tab"
					className="absolute inset-0 rounded-[8px] bg-term-ink"
					transition={{ type: "spring", stiffness: 520, damping: 40 }}
				/>
			)}
			<Icon className="relative h-[18px] w-[18px] shrink-0" aria-hidden />
			<span className="relative">{item.label}</span>
			{soon && (
				<span className="relative ml-auto rounded-[4px] border border-term-rule px-1.5 py-px text-[10px] tracking-[0.08em] text-term-ink-2">
					Soon
				</span>
			)}
		</Link>
	);
}

/** Desktop navigation: the register's terminal body, dark in both themes. */
export function Rail() {
	const pathname = usePathname();
	const openRingUp = useUiStore((s) => s.openRingUp);
	const user = useAuthStore((s) => s.user);
	const sample = useFinanceStore((s) => s.sample);
	const logout = useLogout();

	const who = sample ? "Sample account" : (user?.email ?? "Signed in");
	const initial = (sample ? "S" : (user?.email?.[0] ?? "P")).toUpperCase();

	return (
		<nav
			aria-label="Primary"
			className="terminal fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-term-rule bg-term px-3 pb-4 pt-5 lg:flex"
		>
			<Logo href="/dashboard" tone="terminal" className="px-2" />

			<button
				type="button"
				onClick={() => openRingUp()}
				className="key-enter mt-7 w-full justify-between pl-3.5 pr-2.5"
			>
				<span className="inline-flex items-center gap-2">
					<Plus className="h-4 w-4" aria-hidden strokeWidth={2.5} />
					Ring up
				</span>
				<kbd className="rounded-[4px] bg-black/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold" aria-label="Shortcut: N">
					N
				</kbd>
			</button>

			<ul className="mt-6 flex flex-col gap-0.5">
				{PRIMARY_NAV.map((item) => (
					<li key={item.href}>
						<RailLink item={item} active={isActivePath(pathname, item.href)} />
					</li>
				))}
			</ul>

			<div className="rule-dash mx-3 my-4 opacity-40" aria-hidden />

			<ul className="flex flex-col gap-0.5">
				{RECORDS_NAV.map((item) => (
					<li key={item.href}>
						<RailLink item={item} active={isActivePath(pathname, item.href)} />
					</li>
				))}
				<li>
					<RailLink item={SAVINGS_ITEM} active={isActivePath(pathname, SAVINGS_ITEM.href)} soon />
				</li>
			</ul>

			<div className="mt-auto flex flex-col gap-0.5">
				<RailLink item={SETTINGS_ITEM} active={isActivePath(pathname, SETTINGS_ITEM.href)} />

				<div className="mt-3 flex items-center gap-3 rounded-[8px] border border-term-rule px-3 py-2.5">
					<span
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-term-ink font-mono text-sm font-bold text-term"
						aria-hidden
					>
						{initial}
					</span>
					<span className="min-w-0 flex-1">
						<span className="block truncate text-[13px] text-term-ink">{who}</span>
						{sample && <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-term-ink-2">Dev preview data</span>}
					</span>
					<button
						type="button"
						onClick={logout}
						className="-mr-1.5 inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-term-ink-2 transition-colors hover:bg-term-2 hover:text-term-ink"
						aria-label="Log out"
						title="Log out"
					>
						<LogOut className="h-[18px] w-[18px]" aria-hidden />
					</button>
				</div>
			</div>
		</nav>
	);
}
