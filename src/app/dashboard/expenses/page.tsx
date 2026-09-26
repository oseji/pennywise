"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Pagination from "@/utils/Pagination";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { formatCurrency } from "@/utils/formatMoney";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptySlip } from "@/components/ui/EmptySlip";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { BUCKET_INK } from "@/components/ui/buckets";
import { PrintIn } from "@/components/motion/PrintIn";
import { usePrintOnce } from "@/components/motion/usePrintOnce";
import { LedgerList, LEDGER_COLS } from "@/components/ledger/LedgerList";
import { DeleteEntryDialog } from "@/components/ledger/DeleteEntryDialog";
import { LedgerSkeleton } from "@/components/ledger/LedgerSkeleton";
import { useFinanceStore } from "@/store/useFinanceStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore } from "@/store/useUiStore";
import { spendByBucket, type JournalEntry } from "@/lib/finance/derive";
import { BUCKETS, BUCKET_LABEL, bucketFromExpenseKey, type BudgetBucket } from "@/lib/finance/types";

const itemsPerPage = 10;
type Filter = "all" | BudgetBucket;

const ExpensesPage = () => {
	const { status, expenses, budget, lastAdded, deleteExpense } = useFinanceStore();
	const currency = usePreferencesStore((s) => s.currency);
	const openRingUp = useUiStore((s) => s.openRingUp);
	const play = usePrintOnce("expenses");
	const fmt = (v: number) => formatCurrency(v, currency);

	const [filter, setFilter] = useState<Filter>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pendingDelete, setPendingDelete] = useState<JournalEntry | null>(null);
	const [voidingId, setVoidingId] = useState<string | null>(null);

	const hasBudgetLines = BUCKETS.some((b) => budget[b].length > 0);
	const total = expenses.reduce((s, e) => s + e.amount, 0);
	const byBucket = useMemo(() => spendByBucket(expenses).totals, [expenses]);

	const entries: JournalEntry[] = useMemo(
		() =>
			expenses
				.filter((e) => filter === "all" || bucketFromExpenseKey(String(e.category ?? "")) === filter)
				.map((e) => ({ kind: "expense" as const, ...e })),
		[expenses, filter]
	);
	const totalPages = Math.ceil(entries.length / itemsPerPage);
	const currentItems = entries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	const paginationRange = getPaginationRange(currentPage, totalPages);

	useEffect(() => setCurrentPage(1), [filter]);
	useEffect(() => {
		if (lastAdded?.kind === "expense") {
			setFilter("all");
			setCurrentPage(1);
		}
	}, [lastAdded]);

	const confirmDelete = async () => {
		if (!pendingDelete) return;
		const id = pendingDelete.id;
		setPendingDelete(null);
		setVoidingId(id);
		try {
			await deleteExpense(id);
			setCurrentPage(1);
			toast.success("Expense entry deleted successfully");
		} catch (err) {
			toast.error(formatAddDocError(err));
		} finally {
			setVoidingId(null);
		}
	};

	return (
		<div className="page">
			<PageHeader
				title="Expenses"
				actions={
					<button type="button" className="key-enter" onClick={() => openRingUp("expense")}>
						<Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
						Add a spend
					</button>
				}
			>
				{status !== "ready" ? (
					"Loading…"
				) : expenses.length ? (
					<>
						<span className="num text-[17px] font-semibold text-ink">{fmt(total)}</span> spent, across {expenses.length}{" "}
						{expenses.length === 1 ? "entry" : "entries"}.
					</>
				) : (
					"Everything that goes out, each logged against a budget line."
				)}
			</PageHeader>

			{status !== "ready" ? (
				<LedgerSkeleton />
			) : expenses.length === 0 ? (
				<PrintIn play={play} lines={12} className="slip-shadow">
					<div className="slip-torn px-5 pb-10 pt-3 md:px-7">
						{hasBudgetLines ? (
							<EmptySlip
								title="No spending rung up yet"
								ghosts={[{ label: "Groceries" }, { label: "Transport" }, { label: "Rent" }]}
								actions={
									<button type="button" className="key-enter" onClick={() => openRingUp("expense")}>
										<Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
										Ring up a spend
									</button>
								}
							>
								Pick a bucket and one of your budget lines, and the spend prints here — and counts against that line&apos;s limit.
							</EmptySlip>
						) : (
							<EmptySlip
								title="Start with a budget line"
								ghosts={[{ label: "Groceries", value: "limit —" }, { label: "Rent", value: "limit —" }]}
								actions={
									<Link href="/dashboard/budget" className="key-enter">
										Set up your budget
									</Link>
								}
							>
								Every spend is logged against a budget line — groceries, rent, data — so there&apos;s a limit to measure it by. Add one, then come back to ring up what you spent.
							</EmptySlip>
						)}
					</div>
				</PrintIn>
			) : (
				<div className="flex flex-col gap-5">
					<ChoiceGroup
						name="expense-filter"
						legend="Show"
						hideLegend
						value={filter}
						onChange={setFilter}
						options={[
							{ value: "all" as Filter, label: `All · ${expenses.length}` },
							...BUCKETS.map((b) => ({
								value: b as Filter,
								label: b === "dailyNeeds" ? "Daily" : b === "plannedPayments" ? "Planned" : BUCKET_LABEL[b],
								swatch: BUCKET_INK[b],
							})),
						]}
					/>

					<PrintIn as="section" aria-labelledby="expense-ledger" play={play} delay={0.06} lines={20} className="slip">
						<div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 md:px-5">
							<h2 id="expense-ledger" className="font-mono text-[13px] font-bold uppercase tracking-[0.08em]">
								{filter === "all" ? "All spending" : BUCKET_LABEL[filter]}
							</h2>
							<span className="font-mono text-[14px] font-semibold tabular-nums">
								{fmt(filter === "all" ? total : byBucket[filter])}
							</span>
						</div>
						<div className={`hidden border-y border-dashed border-rule-2 px-5 py-2.5 ${LEDGER_COLS}`} aria-hidden>
							<span className="label">Time</span>
							<span className="label">Narration</span>
							<span className="label">Budget line</span>
							<span className="label text-right">Amount</span>
							<span />
						</div>
						{entries.length ? (
							<LedgerList
								entries={currentItems}
								currency={currency}
								freshId={lastAdded?.kind === "expense" && Date.now() - lastAdded.at < 4000 ? lastAdded.id : null}
								voidingId={voidingId}
								onDelete={setPendingDelete}
							/>
						) : (
							<p className="px-4 py-8 text-center text-[15px] text-ink-3 md:px-5">
								Nothing logged in {filter !== "all" && BUCKET_LABEL[filter]} yet.
							</p>
						)}
						<div className="h-2" />
						{totalPages > 1 && (
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={entries.length}
								itemsPerPage={itemsPerPage}
								paginationRange={paginationRange}
								onPageChange={setCurrentPage}
							/>
						)}
					</PrintIn>
				</div>
			)}

			<DeleteEntryDialog entry={pendingDelete} currency={currency} onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
		</div>
	);
};

export default ExpensesPage;
