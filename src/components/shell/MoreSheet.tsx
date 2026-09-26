"use client";

import Link from "next/link";
import { ChevronRight, LogOut, Moon, Sun } from "lucide-react";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore } from "@/store/useUiStore";
import { RECORDS_NAV, SAVINGS_ITEM, SETTINGS_ITEM, type NavItem } from "./nav";
import { useSwitchTheme } from "./ThemeToggle";
import { useLogout } from "./useLogout";

const row =
	"flex min-h-[52px] w-full items-center gap-3 rounded-[8px] px-3 text-left transition-colors hover:bg-paper-2";

/**
 * Mobile "More": only what the keypad bar doesn't already show —
 * History, Savings, Settings, appearance and logging out.
 */
export function MoreSheet() {
	const { moreOpen, setMoreOpen } = useUiStore();
	const closeNotifications = useNotificationStore((s) => s.close);
	const user = useAuthStore((s) => s.user);
	const sample = useFinanceStore((s) => s.sample);
	const theme = usePreferencesStore((s) => s.theme);
	const switchTheme = useSwitchTheme();
	const logout = useLogout();
	const close = () => setMoreOpen(false);

	const links: { item: NavItem; hint: string; soon?: boolean }[] = [
		{ item: RECORDS_NAV[0], hint: "Every entry, day by day" },
		{ item: SAVINGS_ITEM, hint: "Goals and targets", soon: true },
		{ item: SETTINGS_ITEM, hint: "Currency, security, account" },
	];

	return (
		<AccessibleDialog open={moreOpen} onClose={close} title="More" titleId="more-sheet-title" variant="sheet" className="lg:hidden">
			<p className="mb-3 truncate px-3 text-[13px] text-ink-3">
				{sample ? "Sample account · dev preview data" : `Signed in as ${user?.email ?? "—"}`}
			</p>

			<ul className="flex flex-col">
				{links.map(({ item, hint, soon }) => {
					const Icon = item.icon;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								className={row}
								onClick={() => {
									close();
									closeNotifications();
								}}
							>
								<Icon className="h-5 w-5 text-ink-2" aria-hidden />
								<span className="flex-1">
									<span className="block font-mono text-[13px] font-semibold uppercase tracking-[0.05em]">{item.label}</span>
									<span className="block text-[13px] text-ink-3">{hint}</span>
								</span>
								{soon ? <span className="tag">Soon</span> : <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden />}
							</Link>
						</li>
					);
				})}

				<li>
					<button type="button" className={row} onClick={() => switchTheme(theme === "dark" ? "light" : "dark")}>
						{theme === "dark" ? <Sun className="h-5 w-5 text-ink-2" aria-hidden /> : <Moon className="h-5 w-5 text-ink-2" aria-hidden />}
						<span className="flex-1 font-mono text-[13px] font-semibold uppercase tracking-[0.05em]">
							{theme === "dark" ? "Light mode" : "Dark mode"}
						</span>
					</button>
				</li>
			</ul>

			<div className="rule-dash my-3" aria-hidden />

			<button
				type="button"
				className={`${row} text-neg`}
				onClick={() => {
					close();
					logout();
				}}
			>
				<LogOut className="h-5 w-5" aria-hidden />
				<span className="font-mono text-[13px] font-semibold uppercase tracking-[0.05em]">Log out</span>
			</button>
		</AccessibleDialog>
	);
}
