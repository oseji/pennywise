"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion/easing";
import { formatCurrency, formatPercent } from "@/utils/formatMoney";
import type { CurrencyCode } from "@/store/usePreferencesStore";

export type Part = { key: string; label: string; value: number; color: string };

/**
 * Part-to-whole as one horizontal bar: segments in fixed order, 2px paper
 * gaps between them, legend underneath carrying label, amount and share.
 * Segments draw left to right like a line being printed across.
 */
export function StackedBar({
	parts,
	currency,
	delay = 0,
	play = true,
	label,
}: {
	parts: Part[];
	currency: CurrencyCode;
	delay?: number;
	play?: boolean;
	label: string;
}) {
	const reduced = useReducedMotion();
	const total = parts.reduce((s, p) => s + p.value, 0);
	const visible = parts.filter((p) => p.value > 0);
	let acc = 0;

	return (
		<figure className="m-0 @container">
			<div className="flex h-3.5 w-full gap-[2px] overflow-hidden rounded-[3px]" role="img" aria-label={`${label}: ${visible.map((p) => `${p.label} ${formatPercent(p.value / total)}`).join(", ")}`}>
				{visible.map((p) => {
					const share = p.value / total;
					const start = acc;
					acc += share;
					return (
						<motion.span
							key={p.key}
							className="h-full first:rounded-l-[3px] last:rounded-r-[3px]"
							style={{ background: p.color, flexGrow: share, flexBasis: 0, transformOrigin: "left" }}
							initial={play && !reduced ? { scaleX: 0 } : false}
							animate={{ scaleX: 1 }}
							transition={{ duration: 0.45, delay: delay + start * 0.6, ease: EASE_OUT }}
						/>
					);
				})}
			</div>
			<figcaption>
				<ul className="mt-3 grid gap-x-4 gap-y-2 @[30rem]:grid-cols-3">
					{parts.map((p) => (
						<li key={p.key} className="flex min-w-0 flex-col">
							<span className="flex items-center gap-1.5 text-[13px] text-ink-2">
								<span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: p.color }} aria-hidden />
								<span className="truncate">{p.label}</span>
							</span>
							<span className="font-mono text-[14px] font-semibold tabular-nums text-ink">
								{formatCurrency(p.value, currency)}
								<span className="ml-1.5 text-[12px] font-medium text-ink-3">{total ? formatPercent(p.value / total) : "0%"}</span>
							</span>
						</li>
					))}
				</ul>
			</figcaption>
		</figure>
	);
}

export type RankRow = { key: string; label: string; value: number; share: number; color: string; tag?: string };

/**
 * Ranked receipt lines: name, dotted leader, amount and share, with a thin
 * bar underneath scaled to the largest row. Reads as text first.
 */
export function RankedLines({
	rows,
	currency,
	delay = 0,
	play = true,
}: {
	rows: RankRow[];
	currency: CurrencyCode;
	delay?: number;
	play?: boolean;
}) {
	const reduced = useReducedMotion();
	const max = Math.max(...rows.map((r) => r.value), 1);

	return (
		<ul className="flex flex-col @container">
			{rows.map((r, i) => (
				<li key={r.key} className="py-2">
					<p className="flex items-end text-[14px]">
						<span className="flex min-w-0 items-center gap-2">
							<span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: r.color }} aria-hidden />
							<span className="truncate capitalize text-ink">{r.label}</span>
							{r.tag && <span className="tag hidden shrink-0 @[34rem]:inline-flex">{r.tag}</span>}
						</span>
						<span className="leader" aria-hidden />
						<span className="shrink-0 font-mono font-semibold tabular-nums text-ink">
							{formatCurrency(r.value, currency)}
						</span>
						<span className="ml-2 w-11 shrink-0 text-right font-mono text-[12px] tabular-nums text-ink-3">
							{formatPercent(r.share)}
						</span>
					</p>
					<div className="mt-1.5 h-[5px] w-full rounded-[2px] bg-paper-3" aria-hidden>
						<motion.div
							className="h-full rounded-[2px]"
							style={{ background: r.color, transformOrigin: "left" }}
							initial={play && !reduced ? { scaleX: 0 } : { scaleX: r.value / max }}
							animate={{ scaleX: r.value / max }}
							transition={{ duration: 0.55, delay: delay + i * 0.06, ease: EASE_OUT }}
						/>
					</div>
				</li>
			))}
		</ul>
	);
}
