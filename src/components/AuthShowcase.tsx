"use client";

import { Drum } from "@/components/motion/Drum";
import { PrintIn } from "@/components/motion/PrintIn";
import { SegmentMeter } from "@/components/motion/SegmentMeter";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { formatCurrency } from "@/utils/formatMoney";
import type { MonthFlow } from "@/lib/finance/derive";

// Illustrative figures for the auth screens, labelled as a sample on the slip.
const SAMPLE_IN = 2_610_500;
const SAMPLE_OUT = 1_642_500;
const SAMPLE_BUDGET = 1_931_000;
const SAMPLE_FLOW: MonthFlow[] = [
	{ key: "a", label: "Apr", year: 2026, income: 445_000, spent: 1_012_000, net: -567_000 },
	{ key: "b", label: "May", year: 2026, income: 438_500, spent: 118_400, net: 320_100 },
	{ key: "c", label: "Jun", year: 2026, income: 445_000, spent: 131_200, net: 313_800 },
	{ key: "d", label: "Jul", year: 2026, income: 470_000, spent: 124_900, net: 345_100 },
	{ key: "e", label: "Aug", year: 2026, income: 445_000, spent: 139_000, net: 306_000 },
	{ key: "f", label: "Sep", year: 2026, income: 457_000, spent: 117_000, net: 340_000 },
];

/** The terminal side of the auth screens: a sample report printing out. */
export function AuthShowcase() {
	const fmt = (v: number) => formatCurrency(v, "NGN");

	return (
		<aside
			aria-label="Product preview"
			className="terminal relative hidden flex-col justify-center overflow-hidden bg-term px-10 py-12 lg:flex xl:px-16"
		>
			<div className="mx-auto w-full max-w-[460px]">
				<p className="font-mono text-[26px] font-bold uppercase leading-tight tracking-[-0.01em] text-term-ink xl:text-[30px]">
					Know where your money goes.
				</p>
				<p className="mt-3 max-w-[40ch] text-[16px] leading-relaxed text-term-ink-2">
					Every entry rung up like a receipt. One honest total at the top, the breakdown underneath.
				</p>

				<div className="slip-shadow mt-10" aria-hidden>
					<PrintIn lines={26} delay={0.3}>
						<div className="slip-torn px-6 pb-10 pt-5">
							<div className="flex items-center justify-between">
								<span className="label">Net balance</span>
								<span className="stamp border-rule-2 text-ink-3">Sample</span>
							</div>
							<p className="mt-2 font-mono text-[40px] font-semibold leading-none tracking-[-0.03em] text-ink">
								<Drum value={SAMPLE_IN - SAMPLE_OUT} currency="NGN" delay={0.6} />
							</p>
							<div className="rule-dash my-4" />
							<p className="flex items-end font-mono text-[13px]">
								<span className="font-semibold uppercase tracking-[0.06em] text-ink-2">In</span>
								<span className="leader" />
								<span className="tabular-nums">{fmt(SAMPLE_IN)}</span>
							</p>
							<p className="mt-1 flex items-end font-mono text-[13px]">
								<span className="font-semibold uppercase tracking-[0.06em] text-ink-2">Out</span>
								<span className="leader" />
								<span className="tabular-nums">{fmt(SAMPLE_OUT)}</span>
							</p>
							<SegmentMeter spent={SAMPLE_OUT} limit={SAMPLE_BUDGET} segments={36} className="mt-4" delay={0.9} />
							<div className="rule-dash my-4" />
							<CashFlowChart data={SAMPLE_FLOW} currency="NGN" view="chart" delay={1} />
						</div>
					</PrintIn>
				</div>
			</div>
		</aside>
	);
}
