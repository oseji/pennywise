"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore } from "@/store/useUiStore";
import { usePrintOnce } from "@/components/motion/usePrintOnce";
import { SegmentMeter } from "@/components/motion/SegmentMeter";
import { PageHeader } from "@/components/ui/PageHeader";
import { Slip } from "@/components/ui/Slip";
import { EmptySlip } from "@/components/ui/EmptySlip";
import { BUCKET_INK } from "@/components/ui/buckets";
import { ZReport } from "@/components/dashboard/ZReport";
import { Setup } from "@/components/dashboard/Setup";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { RankedLines, StackedBar } from "@/components/charts/Breakdown";
import { formatCurrency } from "@/utils/formatMoney";
import {
	expenseTotals,
	headline,
	journal,
	lineLimit,
	lineStatus,
	monthlyCashFlow,
	savingsRate,
	spendByBucket,
	spendByLine,
	spentOnLine,
	summarizeBudget,
	summarizeByCategory,
} from "@/lib/finance/derive";
import { formatDayHeading, formatTime } from "@/lib/finance/dates";
import { BUCKETS, BUCKET_LABEL, INCOME_CATEGORIES, type BudgetBucket } from "@/lib/finance/types";

const INCOME_LABEL: Record<string, string> = Object.fromEntries(INCOME_CATEGORIES.map((c) => [c.value, c.label]));

/**
 * Keeps showing the value from when `hold` switched on, and lets the new one
 * through `releaseMs` after it switches off — so a total changed behind the
 * entry sheet rolls in view once the sheet has gone.
 */
function useHeld<T>(value: T, hold: boolean, releaseMs: number): T {
	const latest = useRef(value);
	latest.current = value;
	const [frozen, setFrozen] = useState<{ v: T } | null>(null);
	useEffect(() => {
		if (hold) {
			setFrozen((f) => f ?? { v: latest.current });
			return;
		}
		const t = setTimeout(() => setFrozen(null), releaseMs);
		return () => clearTimeout(t);
	}, [hold, releaseMs]);
	return frozen ? frozen.v : value;
}

function DashboardSkeleton() {
	return (
		<div className="grid items-start gap-5 xl:grid-cols-12" aria-busy="true" aria-label="Loading your report">
			<div className="slip p-6 xl:col-span-7">
				<div className="skeleton h-3 w-28" />
				<div className="skeleton mt-4 h-12 w-3/4" />
				<div className="mt-6 space-y-2.5">
					<div className="skeleton h-3 w-full" />
					<div className="skeleton h-3 w-full" />
				</div>
				<div className="skeleton mt-8 h-2.5 w-full" />
			</div>
			<div className="slip p-6 xl:col-span-5">
				<div className="skeleton h-3 w-24" />
				<div className="mt-6 flex h-40 items-center gap-4">
					{[60, 80, 45, 90, 70, 55].map((h, i) => (
						<div key={i} className="skeleton w-5" style={{ height: `${h}%` }} />
					))}
				</div>
			</div>
		</div>
	);
}

export default function Dashboard() {
	const { status, income, expenses, budget } = useFinanceStore();
	const currency = usePreferencesStore((s) => s.currency);
	const openRingUp = useUiStore((s) => s.openRingUp);
	const ringOpen = useUiStore((s) => s.ringUp.open);
	const play = usePrintOnce("dashboard");
	const [flowView, setFlowView] = useState<"chart" | "table">("chart");

	const d = useMemo(() => {
		const incomeSummary = summarizeByCategory(income);
		const expenseSummary = summarizeByCategory(expenses);
		const budgetSummary = summarizeBudget(budget);
		const head = headline(incomeSummary, expenseSummary, budgetSummary);
		const totals = expenseTotals(expenses);
		const lines = BUCKETS.flatMap((b) =>
			budget[b].map((e) => {
				const spent = spentOnLine(totals, b, e.category);
				const limit = lineLimit(b, e);
				return { bucket: b, entry: e, spent, limit, ...lineStatus(spent, limit) };
			})
		);
		return {
			incomeSummary,
			expenseSummary,
			budgetSummary,
			head,
			lines,
			flow: monthlyCashFlow(income, expenses, 6),
			byBucket: spendByBucket(expenses),
			byLine: spendByLine(expenses),
			recent: journal(income, expenses).slice(0, 6),
			kept: savingsRate(incomeSummary.total, head.net),
		};
	}, [income, expenses, budget]);

	const report = useHeld(
		{
			net: d.head.net,
			incomeTotal: d.incomeSummary.total,
			expenseTotal: d.expenseSummary.total,
			budgetTotal: d.budgetSummary.total,
			hasBudget: d.head.hasBudget,
			budgetRemaining: d.head.budgetRemaining,
			overBudget: d.head.overBudget,
			kept: d.kept,
			entries: income.length + expenses.length,
		},
		ringOpen,
		420
	);

	const fmt = (v: number) => formatCurrency(v, currency);
	const hasIncome = income.length > 0;
	const hasExpense = expenses.length > 0;
	const hasBudget = d.lines.length > 0;
	const setupDone = hasIncome && hasExpense && hasBudget;
	// rendered in both stacks: second on phones, top of the right column on wide screens
	const setupSlip = (className: string, id: string) => (
		<Setup className={className} id={id} hasBudget={hasBudget} hasIncome={hasIncome} hasExpense={hasExpense} play={play} delay={0.12} />
	);
	const nothing = !hasIncome && !hasExpense && !hasBudget;

	const watch = [...d.lines].sort((a, b) => (b.limit > 0 ? b.spent / b.limit : 0) - (a.limit > 0 ? a.spent / a.limit : 0)).slice(0, 5);
	const topLines = d.byLine.slice(0, 6);
	const restLines = d.byLine.slice(6);
	const incomeRows = [...d.incomeSummary.categories].sort((a, b) => b.totalAmount - a.totalAmount);

	return (
		<div className="page">
			<PageHeader title="Dashboard">
				{status !== "ready"
					? "Totting up…"
					: nothing
						? "A fresh roll. Three steps and your first report prints here."
						: d.head.net >= 0
							? "You're ahead. Here's where it came from and where it went."
							: "You've spent more than came in. Here's where it went."}
			</PageHeader>

			{status !== "ready" ? (
				<DashboardSkeleton />
			) : (
				<div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
					{/* Two stacks so each slip ends where its print ends and gutters stay even. */}
					<div className="flex min-w-0 flex-col gap-5 xl:col-span-7">
						<ZReport
							{...report}
							currency={currency}
							play={play}
						/>
						{!setupDone && setupSlip("xl:hidden", "setup-title")}
						{/* Budget watch */}
						<Slip
							id="watch-title"
							title="Budget lines"
							play={play}
							delay={0.22}
							lines={20}
							aside={
								hasBudget && (
									<Link href="/dashboard/budget" className="key-ghost min-h-9 px-2.5 text-[11px]">
										All lines <ArrowRight className="h-3.5 w-3.5" aria-hidden />
									</Link>
								)
							}
						>
							{hasBudget ? (
								<ul className="flex flex-col">
									{watch.map(({ bucket, entry, spent, limit, percentage, over, isOver }) => (
										<li key={entry.id} className="border-b border-dashed border-rule py-3 first:pt-1 last:border-0 last:pb-0">
											<div className="flex items-baseline gap-2">
												<span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: BUCKET_INK[bucket] }} aria-hidden />
												<span className="truncate text-[15px] capitalize text-ink">{entry.category}</span>
												<span className="sr-only">in {BUCKET_LABEL[bucket]}</span>
												<span className="ml-auto shrink-0 font-mono text-[13px] tabular-nums text-ink-2">
													{fmt(spent)} <span className="text-ink-3">/ {fmt(limit)}</span>
												</span>
											</div>
											<SegmentMeter spent={spent} limit={limit} className="mt-2" delay={play ? 0.6 : 0} />
											<p className={`mt-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.05em] ${isOver ? "text-neg" : percentage >= 75 ? "text-warn" : "text-ink-3"}`}>
												{limit <= 0 ? "No limit" : isOver ? `Over by ${fmt(over)}` : `${Math.round(percentage)}% used`}
											</p>
										</li>
									))}
								</ul>
							) : (
								<EmptySlip
									title="No limits set"
									ghosts={[{ label: "Groceries" }, { label: "Rent" }, { label: "Transport" }]}
									actions={
										<Link href="/dashboard/budget" className="key-plain">
											Set your first line
										</Link>
									}
								>
									A budget line is a category with a limit. Once you have some, the ones closest to their limit show up here.
								</EmptySlip>
							)}
						</Slip>
						{/* Where it went */}
						<Slip id="spend-title" title="Where it went" play={play} delay={0.38} lines={20}>
							{hasExpense ? (
								<>
									<StackedBar
										label="Spending by bucket"
										currency={currency}
										play={play}
										delay={0.7}
										parts={BUCKETS.map((b: BudgetBucket) => ({
											key: b,
											label: BUCKET_LABEL[b],
											value: d.byBucket.totals[b],
											color: BUCKET_INK[b],
										}))}
									/>
									<div className="rule-dash my-4" aria-hidden />
									<RankedLines
										currency={currency}
										play={play}
										delay={0.8}
										rows={topLines.map((l) => ({
											key: `${l.bucket}-${l.name}`,
											label: l.name,
											value: l.total,
											share: l.share,
											color: l.bucket ? BUCKET_INK[l.bucket] : "rgb(var(--ink-3))",
											tag: l.bucket ? BUCKET_LABEL[l.bucket] : undefined,
										}))}
									/>
									{restLines.length > 0 && (
										<p className="mt-2 text-[13px] text-ink-3">
											+ {restLines.length} more {restLines.length === 1 ? "line" : "lines"} ·{" "}
											<span className="num">{fmt(restLines.reduce((s, l) => s + l.total, 0))}</span>
										</p>
									)}
								</>
							) : (
								<EmptySlip
									title="No spending logged"
									ghosts={[
										{ label: "Daily needs", value: "—%" },
										{ label: "Planned payments", value: "—%" },
										{ label: "Others", value: "—%" },
									]}
									actions={
										<button type="button" className="key-plain" onClick={() => openRingUp("expense")} disabled={!hasBudget}>
											Ring up a spend
										</button>
									}
								>
									{hasBudget
										? "Each spend is logged against a budget line; this slip splits them by bucket and ranks the lines."
										: "Spends are logged against budget lines, so set one up first — then this slip splits your spending by bucket."}
								</EmptySlip>
							)}
						</Slip>
					</div>
					<div className="flex min-w-0 flex-col gap-5 xl:col-span-5">
						{!setupDone ? (
							setupSlip("hidden xl:flex", "setup-title-wide")
						) : (
							<Slip
								id="flow-title"
								title="Cash flow"
								play={play}
								delay={0.12}
								lines={18}
								aside={
									<button
										type="button"
										className="key-ghost min-h-9 px-2.5 text-[11px]"
										aria-pressed={flowView === "table"}
										onClick={() => setFlowView((v) => (v === "chart" ? "table" : "chart"))}
									>
										{flowView === "chart" ? "Table" : "Chart"}
									</button>
								}
							>
								<p className="mb-3 text-[13px] text-ink-3">Last six months, by month logged</p>
								<CashFlowChart data={d.flow} currency={currency} view={flowView} delay={play ? 0.45 : 0} play={play} />
							</Slip>
						)}
						{/* Recent entries */}
						<Slip
							id="recent-title"
							title="Latest entries"
							play={play}
							delay={0.3}
							lines={18}
							aside={
								(hasIncome || hasExpense) && (
									<Link href="/dashboard/history" className="key-ghost min-h-9 px-2.5 text-[11px]">
										History <ArrowRight className="h-3.5 w-3.5" aria-hidden />
									</Link>
								)
							}
						>
							{d.recent.length ? (
								<ul className="flex flex-col">
									{d.recent.map((e) => (
										<li key={`${e.kind}-${e.id}`} className="flex items-center gap-3 border-b border-dashed border-rule py-2.5 first:pt-1 last:border-0">
											<div className="min-w-0 flex-1">
												<p className="truncate text-[15px] text-ink">{e.narration || "—"}</p>
												<p className="label mt-0.5 normal-case leading-relaxed tracking-normal">
													<span className="uppercase tracking-[0.06em]">
														{e.kind === "income" ? INCOME_LABEL[e.category] ?? (e.category || "Income") : e.subCategory}
													</span>
													{e.createdAt && (
													<>
														{" · "}
														<span className="whitespace-nowrap">{formatDayHeading(e.createdAt)},</span>{" "}
														<span className="whitespace-nowrap">{formatTime(e.createdAt)}</span>
													</>
												)}
												</p>
											</div>
											<span className={`shrink-0 font-mono text-[14px] font-semibold tabular-nums ${e.kind === "income" ? "text-pos" : "text-ink"}`}>
												{e.kind === "income" ? "+" : "−"}
												{fmt(e.amount)}
											</span>
										</li>
									))}
								</ul>
							) : (
								<EmptySlip
									title="The roll is blank"
									ghosts={[{ label: "Today" }, { label: "Yesterday" }]}
									actions={
										<button type="button" className="key-plain" onClick={() => openRingUp("income")}>
											Ring up income
										</button>
									}
								>
									Your last few entries print here, newest first.
								</EmptySlip>
							)}
						</Slip>
						{/* Income sources */}
						<Slip id="sources-title" title="Money in" play={play} delay={0.46} lines={16}>
							{hasIncome ? (
								<RankedLines
									currency={currency}
									play={play}
									delay={0.9}
									rows={incomeRows.map((c) => ({
										key: c.name || "none",
										label: INCOME_LABEL[c.name] ?? (c.name || "Uncategorised"),
										value: c.totalAmount,
										share: c.percentage / 100,
										color: "rgb(var(--chart-in))",
									}))}
								/>
							) : (
								<EmptySlip
									title="Nothing in yet"
									ghosts={[{ label: "Salary" }, { label: "Allowance" }]}
									actions={
										<button type="button" className="key-plain" onClick={() => openRingUp("income")}>
											Ring up income
										</button>
									}
								>
									Income is ranked here by source, so you can see what actually pays for things.
								</EmptySlip>
							)}
						</Slip>
					</div>
				</div>
			)}
		</div>
	);
}
