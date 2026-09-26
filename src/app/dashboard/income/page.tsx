"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Pagination from "@/utils/Pagination";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { formatCurrency } from "@/utils/formatMoney";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptySlip } from "@/components/ui/EmptySlip";
import { PrintIn } from "@/components/motion/PrintIn";
import { usePrintOnce } from "@/components/motion/usePrintOnce";
import { LedgerList, LEDGER_COLS } from "@/components/ledger/LedgerList";
import { DeleteEntryDialog } from "@/components/ledger/DeleteEntryDialog";
import { LedgerSkeleton } from "@/components/ledger/LedgerSkeleton";
import { useFinanceStore } from "@/store/useFinanceStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore } from "@/store/useUiStore";
import { summarizeByCategory, type JournalEntry } from "@/lib/finance/derive";
import { INCOME_CATEGORIES } from "@/lib/finance/types";

const itemsPerPage = 10;

const IncomeScreen = () => {
	const { status, income, lastAdded, deleteIncome } = useFinanceStore();
	const currency = usePreferencesStore((s) => s.currency);
	const openRingUp = useUiStore((s) => s.openRingUp);
	const play = usePrintOnce("income");
	const fmt = (v: number) => formatCurrency(v, currency);

	const [currentPage, setCurrentPage] = useState(1);
	const [pendingDelete, setPendingDelete] = useState<JournalEntry | null>(null);
	const [voidingId, setVoidingId] = useState<string | null>(null);

	const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
	const sources = useMemo(
		() => summarizeByCategory(income).categories.sort((a, b) => b.totalAmount - a.totalAmount),
		[income]
	);

	const entries: JournalEntry[] = useMemo(() => income.map((e) => ({ kind: "income" as const, ...e })), [income]);
	const totalPages = Math.ceil(entries.length / itemsPerPage);
	const currentItems = entries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	const paginationRange = getPaginationRange(currentPage, totalPages);

	// a new entry lands on page one, as the old add flow did
	useEffect(() => {
		if (lastAdded?.kind === "income") setCurrentPage(1);
	}, [lastAdded]);

	const confirmDelete = async () => {
		if (!pendingDelete) return;
		const id = pendingDelete.id;
		setPendingDelete(null);
		setVoidingId(id);
		try {
			await deleteIncome(id);
			setCurrentPage(1);
			toast.success("Income entry deleted successfully");
		} catch (err) {
			toast.error(formatAddDocError(err));
		} finally {
			setVoidingId(null);
		}
	};

	const label = (v: string) => INCOME_CATEGORIES.find((c) => c.value === v)?.label ?? (v || "Uncategorised");

	return (
		<div className="page">
			<PageHeader
				title="Income"
				actions={
					<button type="button" className="key-enter" onClick={() => openRingUp("income")}>
						<Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
						Add income
					</button>
				}
			>
				{status !== "ready" ? (
					"Loading…"
				) : income.length ? (
					<>
						<span className="num text-[17px] font-semibold text-ink">{fmt(totalIncome)}</span> in total, across {income.length}{" "}
						{income.length === 1 ? "entry" : "entries"}.
					</>
				) : (
					"Everything that comes in: salary, allowances, gifts, the odd sale."
				)}
			</PageHeader>

			{status !== "ready" ? (
				<LedgerSkeleton />
			) : income.length === 0 ? (
				<PrintIn play={play} lines={12} className="slip-shadow">
					<div className="slip-torn px-5 pb-10 pt-3 md:px-7">
						<EmptySlip
							title="No income rung up yet"
							ghosts={[{ label: "Salary" }, { label: "Allowance" }, { label: "Gift" }]}
							actions={
								<button type="button" className="key-enter" onClick={() => openRingUp("income")}>
									<Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
									Ring up income
								</button>
							}
						>
							Each payment you log prints here as a line, grouped by day, with its source. Your net balance starts from these.
						</EmptySlip>
					</div>
				</PrintIn>
			) : (
				<div className="flex flex-col gap-5">
					<PrintIn as="section" aria-label="By source" play={play} lines={6} className="slip px-4 py-3.5 md:px-5">
						<ul className="flex flex-wrap gap-x-6 gap-y-2">
							{sources.map((s) => (
								<li key={s.name || "none"} className="flex items-baseline gap-2">
									<span className="h-2 w-2 translate-y-[-1px] rounded-[2px] bg-chart-in" aria-hidden />
									<span className="text-[14px] text-ink-2">{label(s.name)}</span>
									<span className="font-mono text-[14px] font-semibold tabular-nums">{fmt(s.totalAmount)}</span>
								</li>
							))}
						</ul>
					</PrintIn>

					<PrintIn as="section" aria-labelledby="income-ledger" play={play} delay={0.08} lines={20} className="slip">
						<h2 id="income-ledger" className="sr-only">
							Income entries
						</h2>
						<div className={`hidden border-b border-dashed border-rule-2 px-5 py-2.5 ${LEDGER_COLS}`} aria-hidden>
							<span className="label">Time</span>
							<span className="label">Narration</span>
							<span className="label">Source</span>
							<span className="label text-right">Amount</span>
							<span />
						</div>
						<LedgerList
							entries={currentItems}
							currency={currency}
							freshId={lastAdded?.kind === "income" && Date.now() - lastAdded.at < 4000 ? lastAdded.id : null}
							voidingId={voidingId}
							onDelete={setPendingDelete}
						/>
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

export default IncomeScreen;
