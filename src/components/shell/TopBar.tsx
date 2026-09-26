"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { selectUnreadCount, useFinanceStore } from "@/store/useFinanceStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore } from "@/store/useUiStore";
import { ThemeToggle } from "./ThemeToggle";

function SampleTag() {
	const sample = useFinanceStore((s) => s.sample);
	if (!sample) return null;
	return (
		<span className="stamp mr-1 whitespace-nowrap border-warn text-warn" title="Development preview — synthetic data, nothing is saved">
			{sample === "empty" ? "Empty" : "Sample"}
			<span className="hidden sm:inline">{sample === "empty" ? " preview" : " data"}</span>
		</span>
	);
}

/** Unread count on the bell; it re-stamps whenever the count changes. */
function UnreadBadge({ count }: { count: number }) {
	const reduced = useReducedMotion();
	return (
		<AnimatePresence initial={false}>
			{count > 0 && (
				<motion.span
					key={count}
					aria-hidden
					className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] bg-key px-1 font-mono text-[10.5px] font-bold leading-none text-white ring-2 ring-ground"
					initial={reduced ? { opacity: 0 } : { scale: 1.6, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: reduced ? 1 : 0.4, opacity: 0, transition: { duration: 0.14 } }}
					transition={{ duration: 0.2, ease: [0.3, 0, 0.2, 1] }}
				>
					{count > 99 ? "99+" : count}
				</motion.span>
			)}
		</AnimatePresence>
	);
}

export function TopBar() {
	const { isOpen, toggle } = useNotificationStore();
	const notificationsEnabled = usePreferencesStore((s) => s.notificationsEnabled);
	const { moreOpen, setMoreOpen } = useUiStore();
	const unread = useFinanceStore(selectUnreadCount);
	const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

	return (
		<header className="sticky top-0 z-30 border-b border-rule/70 bg-ground">
			<div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-2 px-3 md:px-8 lg:h-16 lg:px-10">
				<Logo href="/dashboard" className="lg:hidden" size={24} />
				<p className="label hidden lg:block" aria-hidden>
					{today}
				</p>

				<div className="ml-auto flex items-center gap-1">
					<SampleTag />
					<ThemeToggle />
					{notificationsEnabled && (
						<button
							type="button"
							onClick={toggle}
							id="notifications-trigger"
							className="key-icon relative"
							aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
							aria-expanded={isOpen}
							aria-controls="notifications-panel"
						>
							<Bell className="h-5 w-5" aria-hidden />
							<UnreadBadge count={unread} />
						</button>
					)}
					<button
						type="button"
						className="key-icon lg:hidden"
						onClick={() => setMoreOpen(true)}
						aria-label="More"
						aria-haspopup="dialog"
						aria-expanded={moreOpen}
					>
						<Menu className="h-5 w-5" aria-hidden />
					</button>
				</div>
			</div>
		</header>
	);
}
