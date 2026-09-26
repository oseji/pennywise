"use client";

import Link from "next/link";
import { Drum } from "@/components/motion/Drum";
import { PrintIn } from "@/components/motion/PrintIn";
import { SegmentMeter, meterTone } from "@/components/motion/SegmentMeter";
import { formatCurrency, formatPercent } from "@/utils/formatMoney";
import type { CurrencyCode } from "@/store/usePreferencesStore";

type Props = {
	net: number;
	incomeTotal: number;
	expenseTotal: number;
	budgetTotal: number;
	hasBudget: boolean;
	budgetRemaining: number;
	overBudget: boolean;
	kept: number | null;
	entries: number;
	currency: CurrencyCode;
	play: boolean;
	className?: string;
};

/**
 * The running report: net balance on the total drum, money in and out on
 * leader lines, then the whole budget as one meter.
 */
export function ZReport({
	net,
	incomeTotal,
	expenseTotal,
	budgetTotal,
	hasBudget,
	budgetRemaining,
	overBudget,
	kept,
	entries,
	currency,
	play,
	className = "",
}: Props) {
	const fmt = (v: number) => formatCurrency(v, currency);

	return (
		<div className={`slip-shadow ${className}`}>
			<PrintIn as="section" aria-labelledby="zreport-title" play={play} lines={22} className="h-full">
				<div className="slip-torn flex h-full flex-col px-5 pb-9 pt-4 [container-type:inline-size] md:px-7 md:pt-5">
					<div className="mb-4 text-center font-mono" aria-hidden>
						<p className="text-[12px] font-bold uppercase tracking-[0.34em] text-ink">Pennywise</p>
						<p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-ink-3">
							Running report · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
						</p>
						<div className="rule-dash mt-3" />
					</div>
					<div className="flex items-center justify-between gap-3">
						<h2 id="zreport-title" className="label">
							Net balance
						</h2>
						<span className="label">{entries === 1 ? "1 entry" : `${entries} entries`} · all time</span>
					</div>

					<p
						className={`mt-3 font-mono text-[clamp(28px,11.5cqi,64px)] font-semibold leading-none tracking-[-0.03em] ${
							net < 0 ? "text-neg" : "text-ink"
						}`}
					>
						<Drum value={net} currency={currency} delay={play ? 0.25 : 0} />
					</p>

					<div className="rule-dash mb-3 mt-5" aria-hidden />

					<dl className="flex flex-col gap-1.5 font-mono text-[14px]">
						<div className="flex items-end">
							<dt className="font-semibold uppercase tracking-[0.06em] text-ink-2">In</dt>
							<span className="leader" aria-hidden />
							<dd className="tabular-nums text-ink">{fmt(incomeTotal)}</dd>
						</div>
						<div className="flex items-end">
							<dt className="font-semibold uppercase tracking-[0.06em] text-ink-2">Out</dt>
							<span className="leader" aria-hidden />
							<dd className="tabular-nums text-ink">{fmt(expenseTotal)}</dd>
						</div>
						{kept !== null && (
							<div className="flex items-end">
								<dt className="font-semibold uppercase tracking-[0.06em] text-ink-2">Kept</dt>
								<span className="leader" aria-hidden />
								<dd className={`tabular-nums ${kept < 0 ? "text-neg" : "text-pos"}`}>
									{kept < 0 ? "−" : ""}
									{formatPercent(Math.abs(kept))} of income
								</dd>
							</div>
						)}
					</dl>

					<div className="rule-dash my-4" aria-hidden />

					{entries === 0 && (
						<p className="max-w-[44ch] text-[15px] leading-relaxed text-ink-2">
							Nothing rung up yet. Log income and spending and this total keeps itself — money in, minus money out.
						</p>
					)}

					<div className="mt-auto pt-4">
						{hasBudget ? (
							<>
								<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
									<p className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-2">
										{overBudget ? "Over budget by" : "Budget left"}
									</p>
									<p className={`font-mono text-[15px] font-semibold tabular-nums ${overBudget ? "text-neg" : "text-ink"}`}>
										{fmt(Math.abs(budgetRemaining))}
									</p>
								</div>
								<SegmentMeter spent={expenseTotal} limit={budgetTotal} segments={40} className="mt-2.5" delay={play ? 0.5 : 0} />
								<p className="mt-2 text-[13px] text-ink-3">
									<span className="num">{fmt(expenseTotal)}</span> of <span className="num">{fmt(budgetTotal)}</span> budgeted
									{meterTone(expenseTotal, budgetTotal) === "warn" && " — getting close"}
								</p>
							</>
						) : (
							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-[14px] text-ink-2">No budget set, so there&apos;s nothing to measure spending against.</p>
								<Link href="/dashboard/budget" className="key-plain min-h-10">
									Set a budget
								</Link>
							</div>
						)}
					</div>
				</div>
			</PrintIn>
		</div>
	);
}
