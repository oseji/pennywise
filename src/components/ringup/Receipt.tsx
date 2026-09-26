"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_IN } from "@/components/motion/easing";
import { PrintIn } from "@/components/motion/PrintIn";
import { BUCKET_INK } from "@/components/ui/buckets";
import { formatCurrency } from "@/utils/formatMoney";
import { BUCKET_LABEL, type BudgetBucket } from "@/lib/finance/types";
import type { CurrencyCode } from "@/store/usePreferencesStore";

export type ReceiptData = {
	kind: "income" | "expense";
	amount: number;
	narration: string;
	heading: string;
	bucket: BudgetBucket | null;
	at: Date;
};

const PRINT_LINES = 16;

/**
 * The slip that prints when an entry is rung up, stamped APPROVED once it's
 * out. When `tearing`, the slip is torn off along its feed edge and lifts
 * away; `onTorn` fires once it's gone (immediately under reduced motion).
 */
export function Receipt({
	data,
	currency,
	tearing = false,
	onTorn,
}: {
	data: ReceiptData;
	currency: CurrencyCode;
	tearing?: boolean;
	onTorn?: () => void;
}) {
	const reduced = useReducedMotion();
	useEffect(() => {
		if (tearing && reduced) onTorn?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per tear
	}, [tearing, reduced]);
	const printTime = PRINT_LINES * 0.028;
	const stamp = data.at
		.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
		.toUpperCase();

	return (
		<div className="-mx-2 rounded-[6px] bg-ground-2 px-4 pb-2 pt-4 dark:bg-ground">
			<motion.div
				className="slip-shadow"
				style={{ transformOrigin: "20% 100%" }}
				animate={tearing && !reduced ? { y: -64, rotate: -6, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
				transition={{ duration: 0.36, ease: EASE_IN }}
				onAnimationComplete={() => {
					if (tearing) onTorn?.();
				}}
			>
				<PrintIn lines={PRINT_LINES}>
					<div className="slip-torn relative px-5 pb-7 pt-5 font-mono text-[13px]">
						<p className="text-center text-[13px] font-bold uppercase tracking-[0.3em]">Pennywise</p>
						<p className="mt-1 text-center text-[11px] text-ink-3">{stamp}</p>
						<div className="rule-dash my-3" />

						<p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
							{data.bucket && (
								<span className="h-2 w-2 rounded-[1px]" style={{ background: BUCKET_INK[data.bucket] }} />
							)}
							{data.kind === "income" ? "Income" : `Spend · ${data.bucket ? BUCKET_LABEL[data.bucket] : ""}`}
						</p>
						<p className="mt-1 font-semibold capitalize text-ink">{data.heading}</p>
						<p className="mt-1 flex text-ink-2">
							<span className="truncate font-sans text-[14px]">{data.narration}</span>
							<span className="leader" />
							<span className="tabular-nums text-ink">{formatCurrency(data.amount, currency)}</span>
						</p>

						<div className="rule-dash my-3" />
						<p className="flex items-baseline font-bold uppercase">
							<span className="tracking-[0.1em]">Total</span>
							<span className="leader" />
							<span className="text-[18px] tabular-nums">
								{data.kind === "income" ? "+" : "−"}
								{formatCurrency(data.amount, currency)}
							</span>
						</p>

						<motion.div
							className="mt-5 flex justify-center"
							initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: -14 }}
							animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: -5 }}
							transition={
								reduced
									? { duration: 0.2, delay: 0.1 }
									: { delay: printTime + 0.05, duration: 0.2, ease: [0.3, 0, 0.2, 1] }
							}
						>
							<span className="stamp border-pos px-3 py-1.5 text-[14px] tracking-[0.24em] text-pos">Approved</span>
						</motion.div>
					</div>
				</PrintIn>
			</motion.div>
		</div>
	);
}
