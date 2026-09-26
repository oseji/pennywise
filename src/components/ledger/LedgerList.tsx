"use client";

import { Fragment } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Trash2 } from "lucide-react";
import { EASE_OUT } from "@/components/motion/easing";
import { BUCKET_INK } from "@/components/ui/buckets";
import { formatCurrency } from "@/utils/formatMoney";
import { dayKey, formatDayHeading, formatTime } from "@/lib/finance/dates";
import { BUCKET_LABEL, INCOME_CATEGORIES, bucketFromExpenseKey } from "@/lib/finance/types";
import type { JournalEntry } from "@/lib/finance/derive";
import type { CurrencyCode } from "@/store/usePreferencesStore";

const INCOME_LABEL: Record<string, string> = Object.fromEntries(INCOME_CATEGORIES.map((c) => [c.value, c.label]));

export const LEDGER_COLS =
	"md:grid md:grid-cols-[4.75rem_minmax(0,1.4fr)_minmax(0,1fr)_8.75rem_2.75rem] md:items-center md:gap-x-3 xl:gap-x-5";

type Props = {
	entries: JournalEntry[];
	currency: CurrencyCode;
	freshId?: string | null;
	voidingId?: string | null;
	onDelete?: (e: JournalEntry) => void;
	/** Show signed amounts (+/−) — on for mixed lists. */
	signed?: boolean;
};

function Category({ e }: { e: JournalEntry }) {
	if (e.kind === "income") {
		return (
			<span className="inline-flex min-w-0 items-center gap-1.5">
				<span className="h-2 w-2 shrink-0 rounded-[2px] bg-chart-in" aria-hidden />
				<span className="truncate">{INCOME_LABEL[e.category] ?? (e.category || "Income")}</span>
			</span>
		);
	}
	const bucket = bucketFromExpenseKey(String(e.category ?? ""));
	return (
		<span className="inline-flex min-w-0 items-center gap-1.5">
			<span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: bucket ? BUCKET_INK[bucket] : "rgb(var(--ink-3))" }} aria-hidden />
			<span className="truncate capitalize">{e.subCategory}</span>
			{bucket && <span className="sr-only">({BUCKET_LABEL[bucket]})</span>}
		</span>
	);
}

/** Entries as a journal roll: grouped under day headings with each day's in/out subtotal. */
export function LedgerList({ entries, currency, freshId, voidingId, onDelete, signed = false }: Props) {
	const reduced = useReducedMotion();
	const fmt = (v: number) => formatCurrency(v, currency);

	const groups: { key: string; date: Date | null; items: JournalEntry[] }[] = [];
	entries.forEach((e) => {
		const key = e.createdAt ? dayKey(e.createdAt) : "undated";
		const last = groups[groups.length - 1];
		if (last && last.key === key) last.items.push(e);
		else groups.push({ key, date: e.createdAt, items: [e] });
	});

	return (
		<div>
			{groups.map((g) => {
				const dayIn = g.items.filter((i) => i.kind === "income").reduce((s, i) => s + i.amount, 0);
				const dayOut = g.items.filter((i) => i.kind === "expense").reduce((s, i) => s + i.amount, 0);
				return (
					<Fragment key={g.key}>
						<div className="flex items-center gap-3 px-4 pb-1.5 pt-4 md:px-5">
							<h3 className="font-mono text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-2">
								{g.date ? formatDayHeading(g.date) : "Undated"}
							</h3>
							<span className="rule-dash flex-1" aria-hidden />
							<span className="font-mono text-[11.5px] tabular-nums text-ink-3">
								{dayIn > 0 && <span className="text-pos">+{fmt(dayIn)}</span>}
								{dayIn > 0 && dayOut > 0 && " "}
								{dayOut > 0 && <span>{"−"}{fmt(dayOut)}</span>}
							</span>
						</div>
						<ul>
						<AnimatePresence initial={false}>
							{g.items.map((e) => {
								const fresh = freshId === e.id;
								const voiding = voidingId === e.id;
								return (
									<motion.li
										key={`${e.kind}-${e.id}`}
										layout={!reduced}
										initial={fresh && !reduced ? { opacity: 0, x: -12, backgroundColor: "rgb(var(--pos-soft))" } : false}
										animate={{ opacity: 1, x: 0, backgroundColor: "rgb(var(--paper) / 0)" }}
										exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: 0.26, ease: EASE_OUT } }}
										transition={{ duration: fresh ? 1.4 : 0.2, x: { duration: 0.4, ease: EASE_OUT } }}
										className={`relative overflow-hidden px-4 py-3 md:px-5 md:py-2.5 ${LEDGER_COLS}`}
									>
										<span className="hidden font-mono text-[12.5px] tabular-nums text-ink-3 md:block">
											{e.createdAt ? formatTime(e.createdAt) : "—"}
										</span>

										<div className="flex min-w-0 items-baseline justify-between gap-3 md:contents">
											<p className="min-w-0 truncate text-[15px] text-ink">{e.narration || "—"}</p>
											<p
												className={`shrink-0 font-mono text-[14.5px] font-semibold tabular-nums md:order-last md:text-right ${
													e.kind === "income" ? "text-pos" : "text-ink"
												}`}
											>
												{signed ? (e.kind === "income" ? "+" : "−") : ""}
												{fmt(e.amount)}
											</p>
										</div>

										<div className="mt-1 flex items-center justify-between gap-3 text-[13px] text-ink-2 md:mt-0 md:contents">
											<span className="min-w-0 md:order-none">
												<Category e={e} />
												<span className="whitespace-nowrap text-ink-3 md:hidden"> · {e.createdAt ? formatTime(e.createdAt) : "—"}</span>
											</span>
											{onDelete ? (
												<button
													type="button"
													className="key-icon -my-2 -mr-2 h-10 w-10 hover:bg-neg-soft hover:text-neg md:order-last md:m-0 md:h-11 md:w-11"
													aria-label={`Delete ${e.narration || "entry"}, ${fmt(e.amount)}`}
													onClick={() => onDelete(e)}
												>
													<Trash2 className="h-4 w-4" aria-hidden />
												</button>
											) : (
												<span className="hidden md:order-last md:block" />
											)}
										</div>

										<AnimatePresence>
											{voiding && (
												<motion.div
													className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper/60"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													aria-hidden
												>
													<motion.span
														className="absolute left-3 right-3 top-1/2 h-[2px] bg-neg"
														style={{ transformOrigin: "left" }}
														initial={{ scaleX: 0 }}
														animate={{ scaleX: 1 }}
														transition={{ duration: 0.3, ease: EASE_OUT }}
													/>
													<motion.span
														className="stamp relative border-neg bg-paper text-[12px] text-neg"
														initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: -12 }}
														animate={{ opacity: 1, scale: 1, rotate: -6 }}
														transition={{ delay: 0.2, duration: 0.18 }}
													>
														Void
													</motion.span>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.li>
								);
							})}
						</AnimatePresence>
						</ul>
					</Fragment>
				);
			})}
		</div>
	);
}
