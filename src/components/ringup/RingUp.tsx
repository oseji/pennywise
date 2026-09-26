"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import toast from "react-hot-toast";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { AmountInput, plainAmount } from "@/components/ui/AmountInput";
import { BUCKET_INK } from "@/components/ui/buckets";
import { Receipt, type ReceiptData } from "./Receipt";
import { useFinanceStore } from "@/store/useFinanceStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore, type RingUpKind } from "@/store/useUiStore";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { formatCurrency } from "@/utils/formatMoney";
import {
	BUCKETS,
	BUCKET_EXPENSE_KEY,
	BUCKET_LABEL,
	INCOME_CATEGORIES,
	type BudgetBucket,
} from "@/lib/finance/types";

type Phase = "form" | "sending" | "approved";

/**
 * Ring up: one entry form for income and spend, reachable from every screen.
 * Validation rules and the documents written are the ones the old per-page
 * "Add" modals used; only the order of fields and the feedback changed.
 */
export function RingUp() {
	const { ringUp, closeRingUp } = useUiStore();
	const currency = usePreferencesStore((s) => s.currency);
	const budget = useFinanceStore((s) => s.budget);
	const addIncome = useFinanceStore((s) => s.addIncome);
	const addExpense = useFinanceStore((s) => s.addExpense);
	const reduced = useReducedMotion();

	const [kind, setKind] = useState<RingUpKind>(ringUp.kind);
	const [amount, setAmount] = useState("");
	const [narration, setNarration] = useState("");
	const [incomeCategory, setIncomeCategory] = useState("");
	const [bucket, setBucket] = useState<BudgetBucket | "">("");
	const [line, setLine] = useState("");
	const [phase, setPhase] = useState<Phase>("form");
	const [error, setError] = useState("");
	const [receipt, setReceipt] = useState<ReceiptData | null>(null);
	// what to do once the receipt has been torn off
	const [tearing, setTearing] = useState<null | "done" | "another">(null);
	const doneRef = useRef<HTMLButtonElement>(null);

	// Opening picks up the preset kind and a sensible bucket; closing resets after the exit animation.
	useEffect(() => {
		if (ringUp.open) {
			setKind(ringUp.kind);
			setPhase("form");
			setTearing(null);
			setError("");
			setBucket((b) => b || BUCKETS.find((x) => budget[x].length > 0) || "dailyNeeds");
			return;
		}
		const t = setTimeout(() => {
			setAmount("");
			setNarration("");
			setIncomeCategory("");
			setLine("");
			setReceipt(null);
			setPhase("form");
		}, 300);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- react to open/close only
	}, [ringUp.open]);

	const lines = useMemo(() => {
		if (!bucket) return [];
		return Array.from(new Set(budget[bucket].map((e) => e.category).filter(Boolean)));
	}, [budget, bucket]);

	useEffect(() => {
		if (line && !lines.includes(line)) setLine("");
	}, [lines, line]);

	const plain = plainAmount(amount);
	const amountValue = Number(plain);

	const submit = async () => {
		setError("");
		const categoryInput = bucket ? BUCKET_EXPENSE_KEY[bucket] : "";

		if (kind === "income") {
			if (!narration.trim() || isNaN(Number(plain)) || Number(plain) <= 0) {
				setError("Narration and a valid income amount are required");
				return;
			}
		} else if (
			!categoryInput.trim() ||
			!line.trim() ||
			!narration.trim() ||
			isNaN(Number(plain)) ||
			Number(plain) <= 0
		) {
			setError("All fields are required and amount must be a valid number");
			return;
		}

		setPhase("sending");
		try {
			if (kind === "income") {
				await addIncome({ narration, category: incomeCategory, amount: plain }, currency);
			} else {
				await addExpense({ category: categoryInput, subCategory: line, narration, amount: plain }, currency);
			}
			setReceipt({
				kind,
				amount: Number(plain),
				narration,
				heading: kind === "income" ? incomeCategory || "Income" : line,
				bucket: kind === "expense" && bucket ? bucket : null,
				at: new Date(),
			});
			setPhase("approved");
		} catch (err) {
			// inputs are kept so nothing typed is lost
			toast.error(formatAddDocError(err));
			setPhase("form");
		}
	};

	const another = () => {
		setAmount("");
		setNarration("");
		setLine("");
		setIncomeCategory("");
		setReceipt(null);
		setTearing(null);
		setPhase("form");
	};

	const onTorn = () => {
		if (tearing === "another") another();
		else closeRingUp();
	};

	useEffect(() => {
		if (phase === "approved") {
			const t = setTimeout(() => doneRef.current?.focus({ preventScroll: true }), 60);
			return () => clearTimeout(t);
		}
	}, [phase]);

	const sending = phase === "sending";

	return (
		<AccessibleDialog
			open={ringUp.open}
			onClose={closeRingUp}
			title={phase === "approved" ? "Approved" : "Ring up"}
			titleId="ringup-title"
			variant="responsive"
			panelClassName="md:max-w-[480px]"
		>
			<p aria-live="polite" className="sr-only">
				{phase === "approved" && receipt
					? `Approved. ${formatCurrency(receipt.amount, currency)} ${receipt.kind === "income" ? "income" : "spend"} logged.`
					: ""}
			</p>

			<AnimatePresence mode="wait" initial={false}>
				{phase === "approved" && receipt ? (
					<motion.div
						key="receipt"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.12 }}
					>
						<Receipt data={receipt} currency={currency} tearing={!!tearing} onTorn={onTorn} />
						<div className="mt-5 grid grid-cols-2 gap-3">
							<button type="button" className="key-plain" onClick={() => setTearing("another")} disabled={!!tearing}>
								Ring up another
							</button>
							<button ref={doneRef} type="button" className="key-enter" onClick={() => setTearing("done")} disabled={!!tearing}>
								Done
							</button>
						</div>
					</motion.div>
				) : (
					<motion.form
						key="form"
						initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.16 }}
						className="flex flex-col gap-5"
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							submit();
						}}
					>
						<ChoiceGroup
							name="ringup-kind"
							legend="Entry type"
							hideLegend
							variant="segmented"
							value={kind}
							onChange={(k) => {
								setKind(k);
								setError("");
							}}
							options={[
								{ value: "expense", label: "Spend" },
								{ value: "income", label: "Income" },
							]}
						/>

						<div>
							<label htmlFor="ringup-amount" className="field-label">
								Amount
							</label>
							<AmountInput
								id="ringup-amount"
								value={amount}
								onChange={setAmount}
								currency={currency}
								invalid={!!error && !(amountValue > 0)}
								autoFocus
							/>
						</div>

						{kind === "expense" ? (
							<>
								<ChoiceGroup
									name="ringup-bucket"
									legend="Bucket"
									variant="segmented"
									value={bucket}
									onChange={setBucket}
									options={BUCKETS.map((b) => ({
										value: b,
										label: b === "dailyNeeds" ? "Daily" : b === "plannedPayments" ? "Planned" : BUCKET_LABEL[b],
										swatch: BUCKET_INK[b],
									}))}
								/>

								{bucket && lines.length > 0 ? (
									<ChoiceGroup
										name="ringup-line"
										legend="Budget line"
										value={line}
										onChange={setLine}
										options={lines.map((l) => ({ value: l, label: l }))}
									/>
								) : bucket ? (
									<div className="rounded-[6px] border border-dashed border-rule-2 px-3.5 py-3">
										<p className="text-[14px] text-ink-2">
											Spending is logged against a budget line, and{" "}
											<span className="font-semibold text-ink">{BUCKET_LABEL[bucket]}</span> has none yet.
										</p>
										<Link
											href={`/dashboard/budget?add=${bucket}`}
											onClick={closeRingUp}
											className="key-plain mt-3 min-h-10"
										>
											Add a {BUCKET_LABEL[bucket].toLowerCase()} line
										</Link>
									</div>
								) : null}
							</>
						) : (
							<ChoiceGroup
								name="ringup-income-category"
								legend="Source"
								value={incomeCategory}
								onChange={setIncomeCategory}
								options={INCOME_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
							/>
						)}

						<div>
							<label htmlFor="ringup-narration" className="field-label">
								Narration
							</label>
							<input
								id="ringup-narration"
								className="field"
								type="text"
								autoComplete="off"
								placeholder={kind === "income" ? "e.g. September salary" : "e.g. Weekly shop"}
								value={narration}
								onChange={(e) => setNarration(e.target.value)}
							/>
						</div>

						{error && (
							<p role="alert" className="-mb-1 text-[14px] font-medium text-neg">
								{error}
							</p>
						)}

						<button type="submit" className="key-enter min-h-12 w-full text-[13px]" disabled={sending}>
							{sending ? (
								<span className="inline-flex items-center gap-2">
									Printing
									<PrintingDots />
								</span>
							) : amountValue > 0 ? (
								<>
									Ring up <span className="num normal-case tracking-normal">{formatCurrency(amountValue, currency)}</span>
								</>
							) : (
								"Ring up"
							)}
						</button>
					</motion.form>
				)}
			</AnimatePresence>
		</AccessibleDialog>
	);
}

/** Three dots that step like a print head while the write is in flight. */
function PrintingDots() {
	const reduced = useReducedMotion();
	return (
		<span className="inline-flex gap-1" aria-hidden>
			{[0, 1, 2].map((i) => (
				<motion.span
					key={i}
					className="h-1 w-1 bg-current"
					animate={reduced ? undefined : { opacity: [0.2, 1, 0.2] }}
					transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "linear" }}
				/>
			))}
		</span>
	);
}
