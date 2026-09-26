"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { PrintIn } from "@/components/motion/PrintIn";
import { useUiStore } from "@/store/useUiStore";

type Props = { hasBudget: boolean; hasIncome: boolean; hasExpense: boolean; play: boolean; delay?: number; className?: string; id?: string };

/**
 * First-run checklist, set as the setup slip a new register prints.
 * Steps tick themselves off from real data; the slip disappears once all three are done.
 */
export function Setup({ hasBudget, hasIncome, hasExpense, play, delay = 0, className = "", id = "setup-title" }: Props) {
	const openRingUp = useUiStore((s) => s.openRingUp);
	const reduced = useReducedMotion();
	const done = [hasBudget, hasIncome, hasExpense].filter(Boolean).length;

	const steps = [
		{
			done: hasBudget,
			title: "Set a budget line",
			body: "Give a category a limit — groceries, rent, data. Spending is measured against these.",
			action: (
				<Link href="/dashboard/budget" className="key-plain min-h-10">
					Open budget
				</Link>
			),
		},
		{
			done: hasIncome,
			title: "Ring up your income",
			body: "Salary, allowances, gifts. Your balance starts here.",
			action: (
				<button type="button" className="key-plain min-h-10" onClick={() => openRingUp("income")}>
					Add income
				</button>
			),
		},
		{
			done: hasExpense,
			title: "Ring up a spend",
			body: hasBudget
				? "Log something you bought against one of your budget lines."
				: "Once a budget line exists, log what you spend against it.",
			action: (
				<button type="button" className="key-plain min-h-10" onClick={() => openRingUp("expense")} disabled={!hasBudget}>
					Add a spend
				</button>
			),
		},
	];

	return (
		<PrintIn as="section" aria-labelledby={id} play={play} delay={delay} lines={20} className={`slip flex flex-col ${className}`}>
			<div className="flex min-h-[52px] items-center justify-between px-4 pt-2 md:px-5">
				<h2 id={id} className="font-mono text-[13px] font-bold uppercase tracking-[0.08em]">
					Get set up
				</h2>
				<span className="font-mono text-[13px] font-semibold tabular-nums text-ink-3" aria-label={`${done} of 3 done`}>
					{done}/3
				</span>
			</div>
			<div className="rule-dash mx-4 md:mx-5" aria-hidden />
			<ol className="flex flex-col px-4 pb-2 md:px-5">
				{steps.map((s, i) => (
					<li key={s.title} className="flex gap-3.5 border-b border-dashed border-rule py-4 last:border-0">
						<span
							className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] font-mono text-[13px] font-bold ${
								s.done ? "bg-pos text-paper" : "ring-1 ring-inset ring-rule-2 text-ink-2"
							}`}
							aria-hidden
						>
							{s.done ? (
								<motion.span
									initial={reduced ? false : { scale: 0.4, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.25 }}
								>
									<Check className="h-4 w-4" strokeWidth={3} />
								</motion.span>
							) : (
								i + 1
							)}
						</span>
						<div className="min-w-0 flex-1">
							<h3 className={`font-mono text-[13px] font-bold uppercase tracking-[0.05em] ${s.done ? "text-ink-3 line-through decoration-2" : "text-ink"}`}>
								{s.title}
								<span className="sr-only">{s.done ? " (done)" : ""}</span>
							</h3>
							{!s.done && (
								<>
									<p className="mt-1 text-[14px] leading-relaxed text-ink-2">{s.body}</p>
									<div className="mt-3">{s.action}</div>
								</>
							)}
						</div>
					</li>
				))}
			</ol>
		</PrintIn>
	);
}
