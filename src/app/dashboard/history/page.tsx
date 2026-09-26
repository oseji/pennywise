"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import Pagination from "@/utils/Pagination";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { formatCurrency } from "@/utils/formatMoney";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptySlip } from "@/components/ui/EmptySlip";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { PrintIn } from "@/components/motion/PrintIn";
import { usePrintOnce } from "@/components/motion/usePrintOnce";
import { LedgerList, LEDGER_COLS } from "@/components/ledger/LedgerList";
import { LedgerSkeleton } from "@/components/ledger/LedgerSkeleton";
import { useFinanceStore } from "@/store/useFinanceStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useUiStore } from "@/store/useUiStore";
import { journal, type JournalEntry } from "@/lib/finance/derive";
import { dayKey, monthKey } from "@/lib/finance/dates";
import { BUCKET_LABEL, bucketFromExpenseKey } from "@/lib/finance/types";

const PER_PAGE = 20;
type Kind = "all" | "income" | "expense";

const csvCell = (v: string | number) => {
	const s = String(v ?? "");
	return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function exportCsv(rows: JournalEntry[]) {
	const header = ["Date", "Type", "Bucket", "Category", "Narration", "Amount"];
	const lines = rows.map((e) => {
		const bucket = e.kind === "expense" ? bucketFromExpenseKey(String(e.category ?? "")) : null;
		return [
			e.createdAt ? e.createdAt.toISOString() : "",
			e.kind === "income" ? "Income" : "Expense",
			bucket ? BUCKET_LABEL[bucket] : "",
			e.kind === "income" ? e.category : e.subCategory,
			e.narration,
			e.amount,
		]
			.map(csvCell)
			.join(",");
	});
	const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `pennywise-history-${dayKey(new Date())}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

/** Every income and expense entry on one roll, with search, filters and CSV export. */
export default function HistoryPage() {
	const { status, income, expenses } = useFinanceStore();
	const currency = usePreferencesStore((s) => s.currency);
	const openRingUp = useUiStore((s) => s.openRingUp);
	const play = usePrintOnce("history");
	const fmt = (v: number) => formatCurrency(v, currency);

	const [kind, setKind] = useState<Kind>("all");
	const [month, setMonth] = useState("all");
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);

	const all = useMemo(() => journal(income, expenses), [income, expenses]);

	const months = useMemo(() => {
		const seen = new Map<string, string>();
		all.forEach((e) => {
			if (!e.createdAt) return;
			const k = monthKey(e.createdAt);
			if (!seen.has(k)) seen.set(k, e.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" }));
		});
		return [...seen.entries()];
	}, [all]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return all.filter((e) => {
			if (kind !== "all" && e.kind !== kind) return false;
			if (month !== "all" && (!e.createdAt || monthKey(e.createdAt) !== month)) return false;
			if (!q) return true;
			const hay = [e.narration, e.category, e.kind === "expense" ? e.subCategory : ""].join(" ").toLowerCase();
			return hay.includes(q);
		});
	}, [all, kind, month, query]);

	const totIn = filtered.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
	const totOut = filtered.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
	const totalPages = Math.ceil(filtered.length / PER_PAGE);
	const current = Math.min(page, Math.max(1, totalPages));
	const pageItems = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

	const reset = (fn: () => void) => {
		fn();
		setPage(1);
	};

	return (
		<div className="page">
			<PageHeader
				title="History"
				actions={
					all.length > 0 && (
						<button type="button" className="key-plain" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
							<Download className="h-4 w-4" aria-hidden />
							Export CSV
						</button>
					)
				}
			>
				Every entry on one roll, newest first.
			</PageHeader>

			{status !== "ready" ? (
				<LedgerSkeleton rows={8} />
			) : all.length === 0 ? (
				<PrintIn play={play} lines={12} className="slip-shadow">
					<div className="slip-torn px-5 pb-10 pt-3 md:px-7">
						<EmptySlip
							title="The journal is blank"
							ghosts={[{ label: "Today" }, { label: "Yesterday" }, { label: "Mon 21 Sept" }]}
							actions={
								<button type="button" className="key-enter" onClick={() => openRingUp()}>
									<Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
									Ring up an entry
								</button>
							}
						>
							Income and spending land here together, day by day, with each day&apos;s in and out. Search it, filter it, or export it as a spreadsheet.
						</EmptySlip>
					</div>
				</PrintIn>
			) : (
				<div className="flex flex-col gap-5">
					<div className="flex flex-col gap-3 md:flex-row md:items-end">
						<div className="relative md:w-72">
							<label htmlFor="history-search" className="sr-only">
								Search entries
							</label>
							<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
							<input
								id="history-search"
								type="search"
								className="field pl-10"
								placeholder="Search narration or category"
								value={query}
								onChange={(e) => reset(() => setQuery(e.target.value))}
							/>
						</div>
						<ChoiceGroup
							name="history-kind"
							legend="Type"
							hideLegend
							variant="segmented"
							className="md:w-72"
							value={kind}
							onChange={(v) => reset(() => setKind(v))}
							options={[
								{ value: "all" as Kind, label: "All" },
								{ value: "income" as Kind, label: "In" },
								{ value: "expense" as Kind, label: "Out" },
							]}
						/>
						<div className="md:w-56">
							<label htmlFor="history-month" className="sr-only">
								Month
							</label>
							<select id="history-month" className="field" value={month} onChange={(e) => reset(() => setMonth(e.target.value))}>
								<option value="all">All months</option>
								{months.map(([k, label]) => (
									<option key={k} value={k}>
										{label}
									</option>
								))}
							</select>
						</div>
					</div>

					<PrintIn as="section" aria-labelledby="history-roll" play={play} lines={22} className="slip">
						<div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pb-2 pt-4 font-mono text-[13px] md:px-5">
							<h2 id="history-roll" className="mr-auto font-bold uppercase tracking-[0.08em]">
								{filtered.length} {filtered.length === 1 ? "entry" : "entries"}
							</h2>
							<span className="tabular-nums text-pos">In {fmt(totIn)}</span>
							<span className="tabular-nums text-ink">Out {fmt(totOut)}</span>
							<span className={`font-semibold tabular-nums ${totIn - totOut < 0 ? "text-neg" : "text-ink"}`}>
								Net {formatCurrency(totIn - totOut, currency, { signed: true })}
							</span>
						</div>
						<div className={`hidden border-y border-dashed border-rule-2 px-5 py-2.5 ${LEDGER_COLS}`} aria-hidden>
							<span className="label">Time</span>
							<span className="label">Narration</span>
							<span className="label">Category</span>
							<span className="label text-right">Amount</span>
							<span />
						</div>

						{filtered.length ? (
							<LedgerList entries={pageItems} currency={currency} signed />
						) : (
							<div className="px-4 py-10 text-center md:px-5">
								<p className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-2">No matches</p>
								<p className="mt-1 text-[15px] text-ink-3">Try a different search, or clear the filters.</p>
								<button
									type="button"
									className="key-plain mt-4"
									onClick={() => reset(() => {
										setQuery("");
										setKind("all");
										setMonth("all");
									})}
								>
									Clear filters
								</button>
							</div>
						)}
						<div className="h-2" />
						{totalPages > 1 && (
							<Pagination
								currentPage={current}
								totalPages={totalPages}
								totalItems={filtered.length}
								itemsPerPage={PER_PAGE}
								paginationRange={getPaginationRange(current, totalPages)}
								onPageChange={setPage}
							/>
						)}
					</PrintIn>
				</div>
			)}
		</div>
	);
}
