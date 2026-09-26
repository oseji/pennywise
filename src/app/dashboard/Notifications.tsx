"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCheck, Mail, MailOpen, X } from "lucide-react";
import { EASE_OUT } from "@/components/motion/easing";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { selectUnreadCount, useFinanceStore } from "@/store/useFinanceStore";

type View = "all" | "unread";

const Notifications = () => {
	const status = useFinanceStore((s) => s.status);
	const items = useFinanceStore((s) => s.notifications);
	const unread = useFinanceStore(selectUnreadCount);
	const { reloadNotifications, setNotificationRead, markAllNotificationsRead } = useFinanceStore();
	const [refreshing, setRefreshing] = useState(false);
	const [view, setView] = useState<View>("all");
	const { isOpen, close } = useNotificationStore();
	const notificationsEnabled = usePreferencesStore((s) => s.notificationsEnabled);
	const panelRef = useRef<HTMLDivElement>(null);
	const reduced = useReducedMotion();

	// Popover behaviour: focus moves into the panel on open, Escape or an
	// outside click closes it, and focus goes back to the bell.
	useEffect(() => {
		if (!isOpen) return;
		const panel = panelRef.current;
		const t = setTimeout(() => panel?.focus({ preventScroll: true }), 20);
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		const onPointer = (e: PointerEvent) => {
			const target = e.target as Node;
			const trigger = document.getElementById("notifications-trigger");
			if (panelRef.current?.contains(target) || trigger?.contains(target)) return;
			close();
		};
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointer);
		return () => {
			clearTimeout(t);
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointer);
			const trigger = document.getElementById("notifications-trigger");
			const active = document.activeElement;
			if (trigger && (active === document.body || panel?.contains(active))) trigger.focus();
		};
	}, [isOpen, close]);

	// Opening refreshes the feed (activity may have come from another device) while showing what's loaded.
	useEffect(() => {
		if (!isOpen || status !== "ready") return;
		let live = true;
		setRefreshing(true);
		reloadNotifications().finally(() => live && setRefreshing(false));
		return () => {
			live = false;
		};
	}, [isOpen, status, reloadNotifications]);

	if (!notificationsEnabled) return null;

	const shown = view === "unread" ? items.filter((n) => !n.read) : items;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					ref={panelRef}
					id="notifications-panel"
					tabIndex={-1}
					role="region"
					aria-label="Notifications"
					className="fixed left-3 right-3 top-[60px] z-50 flex max-h-[min(72dvh,600px)] flex-col rounded-paper bg-paper shadow-lift outline-none dark:ring-1 dark:ring-rule md:left-auto md:right-8 md:w-[420px] lg:top-[68px]"
					initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, clipPath: "inset(-5% -5% 100% -5%)" }}
					animate={
						reduced
							? { opacity: 1 }
							: { opacity: 1, y: 0, clipPath: "inset(-5% -5% -5% -5%)", transition: { duration: 0.32, ease: EASE_OUT } }
					}
					exit={{ opacity: 0, y: reduced ? 0 : -6, transition: { duration: 0.14 } }}
				>
					<div className="flex items-center gap-2 px-4 pb-2 pt-3">
						<h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.08em]">Activity</h2>
						<p className="font-mono text-[12px] font-semibold tabular-nums text-ink-3" aria-live="polite">
							{unread ? `${unread} unread` : "All read"}
						</p>
						<button
							type="button"
							className="key-ghost ml-auto min-h-9 px-2 text-[11px]"
							onClick={markAllNotificationsRead}
							disabled={!unread}
						>
							<CheckCheck className="h-3.5 w-3.5" aria-hidden />
							Mark all read
						</button>
						<button type="button" className="key-icon -mr-2" onClick={close} aria-label="Close notifications">
							<X className="h-4 w-4" aria-hidden />
						</button>
					</div>

					{items.length > 0 && (
						<div className="px-4 pb-3">
							<ChoiceGroup
								name="notification-view"
								legend="Show"
								hideLegend
								variant="segmented"
								value={view}
								onChange={setView}
								options={[
									{ value: "all" as View, label: `All · ${items.length}` },
									{ value: "unread" as View, label: `Unread · ${unread}` },
								]}
							/>
						</div>
					)}
					<div className="rule-dash mx-4" aria-hidden />

					<div className="overflow-y-auto overscroll-contain px-4 py-1" aria-busy={refreshing}>
						{status !== "ready" && items.length === 0 ? (
							<ul className="flex flex-col gap-3 py-3" aria-label="Loading">
								{[0, 1, 2].map((i) => (
									<li key={i} className="flex flex-col gap-2">
										<span className="skeleton h-2.5 w-24" />
										<span className="skeleton h-3 w-full" />
									</li>
								))}
							</ul>
						) : shown.length === 0 ? (
							<div className="py-8 text-center">
								<p className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-2">
									{items.length ? "All caught up" : "No activity yet"}
								</p>
								<p className="mx-auto mt-1 max-w-[30ch] text-[14px] text-ink-3">
									{items.length
										? "Nothing unread. New entries you ring up will show here first."
										: "Each income or spend you ring up gets a line here."}
								</p>
							</div>
						) : (
							<ul className="flex flex-col">
								<AnimatePresence initial={false}>
									{shown.map((n, i) => (
										<motion.li
											key={n.id}
											layout={!reduced}
											exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
											className="flex items-start gap-3 overflow-hidden border-b border-dashed border-rule py-2.5 last:border-0"
										>
											<span className="mt-[7px] flex h-2 w-2 shrink-0 items-center justify-center" aria-hidden>
												<AnimatePresence initial={false}>
													{!n.read && (
														<motion.span
															className="h-2 w-2 rounded-full bg-key"
															initial={reduced ? { opacity: 0 } : { scale: 0 }}
															animate={{ scale: 1, opacity: 1 }}
															exit={reduced ? { opacity: 0 } : { scale: 0, transition: { delay: i * 0.03, duration: 0.16 } }}
														/>
													)}
												</AnimatePresence>
											</span>
											<div className="min-w-0 flex-1">
												<p className="label">
													{n.date}
													<span className="sr-only">{n.read ? ", read" : ", unread"}</span>
												</p>
												<p
													className={`mt-0.5 text-[14px] leading-snug transition-colors duration-200 ${
														n.read ? "text-ink-2" : "font-semibold text-ink"
													}`}
												>
													{n.notification}
												</p>
											</div>
											<button
												type="button"
												className="key-icon -my-1.5 -mr-2 h-10 w-10"
												onClick={() => setNotificationRead(n.id, !n.read)}
												aria-label={n.read ? "Mark as unread" : "Mark as read"}
												title={n.read ? "Mark as unread" : "Mark as read"}
											>
												{n.read ? <Mail className="h-4 w-4" aria-hidden /> : <MailOpen className="h-4 w-4" aria-hidden />}
											</button>
										</motion.li>
									))}
								</AnimatePresence>
							</ul>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default Notifications;
