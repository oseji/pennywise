"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { AccessibleDialog } from "@/components/AccessibleDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptySlip } from "@/components/ui/EmptySlip";
import { AmountInput, groupAmount, plainAmount } from "@/components/ui/AmountInput";
import { BUCKET_HINT, BUCKET_INK, BUCKET_SUGGESTIONS } from "@/components/ui/buckets";
import { PrintIn } from "@/components/motion/PrintIn";
import { SegmentMeter } from "@/components/motion/SegmentMeter";
import { usePrintOnce } from "@/components/motion/usePrintOnce";
import { EASE_OUT } from "@/components/motion/easing";
import { useFinanceStore } from "@/store/useFinanceStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { formatCurrency } from "@/utils/formatMoney";
import { expenseTotals, lineLimit, lineStatus, spentOnLine } from "@/lib/finance/derive";
import { BUCKETS, BUCKET_EXPENSE_KEY, BUCKET_LABEL, type BudgetBucket, type BudgetEntry } from "@/lib/finance/types";

type EditingEntry = {
	id: string;
	budgetSection: BudgetBucket;
	category: string;
	description: string;
	amount: string;
	setLimit: string;
};

type Line = { entry: BudgetEntry; spent: number; limit: number; percentage: number; over: number; isOver: boolean };

const COLS = "md:grid md:grid-cols-[minmax(0,1.5fr)_8.5rem_8.5rem_minmax(9rem,1.3fr)_5.75rem] md:items-center md:gap-x-5";

function BudgetRow({
	line,
	fresh,
	voiding,
	onEdit,
	onDelete,
}: {
	line: Line;
	fresh: boolean;
	voiding: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const currency = usePreferencesStore((s) => s.currency);
	const reduced = useReducedMotion();
	const fmt = (v: number) => formatCurrency(v, currency);
	const { entry, spent, limit, percentage, over, isOver } = line;
	const status = limit <= 0 ? "No limit" : isOver ? `Over by ${fmt(over)}` : `${Math.round(percentage)}% used`;
	const statusTone = isOver ? "text-neg" : percentage >= 75 ? "text-warn" : "text-ink-3";

	return (
		<motion.li
			layout={!reduced}
			initial={fresh && !reduced ? { opacity: 0, backgroundColor: "rgb(var(--pos-soft))" } : false}
			animate={{ opacity: 1, backgroundColor: "rgb(var(--paper) / 0)" }}
			exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.28, ease: EASE_OUT } }}
			transition={{ duration: fresh ? 1.4 : 0.2 }}
			className={`relative overflow-hidden border-b border-dashed border-rule px-4 py-4 last:border-0 md:px-5 md:py-3.5 ${COLS}`}
		>
			{/* Line */}
			<div className="flex min-w-0 items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-[16px] font-medium capitalize text-ink">{entry.category}</p>
					{entry.description && <p className="mt-0.5 line-clamp-2 text-[14px] text-ink-3">{entry.description}</p>}
				</div>
				<RowActions name={entry.category} onEdit={onEdit} onDelete={onDelete} className="-mr-2 -mt-1.5 md:hidden" />
			</div>

			{/* Limit / Spent: stacked labels on phones, aligned columns from md */}
			<dl className="mt-3 grid grid-cols-2 gap-3 md:contents">
				<div className="md:text-right">
					<dt className="label md:sr-only">Limit</dt>
					<dd className="font-mono text-[14px] tabular-nums text-ink">{fmt(limit)}</dd>
				</div>
				<div className="text-right">
					<dt className="label md:sr-only">Spent</dt>
					<dd className={`font-mono text-[14px] font-semibold tabular-nums ${isOver ? "text-neg" : "text-ink"}`}>{fmt(spent)}</dd>
				</div>
			</dl>

			{/* Status */}
			<div className="mt-3 md:mt-0">
				<SegmentMeter spent={spent} limit={limit} segments={24} />
				<p className={`mt-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-[0.05em] ${statusTone}`}>{status}</p>
			</div>

			<RowActions name={entry.category} onEdit={onEdit} onDelete={onDelete} className="hidden justify-end md:flex" />

			<AnimatePresence>
				{voiding && (
					<motion.div
						className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper/60"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						aria-hidden
					>
						<motion.span
							className="absolute left-3 right-3 top-1/2 h-[2px] bg-neg"
							style={{ transformOrigin: "left" }}
							initial={{ scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ duration: 0.3, ease: EASE_OUT }}
						/>
						<motion.span
							className="stamp relative border-neg bg-paper text-[13px] text-neg"
							initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: -12 }}
							animate={{ opacity: 1, scale: 1, rotate: -6 }}
							transition={{ delay: 0.2, duration: 0.18 }}
						>
							Void
						</motion.span>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.li>
	);
}

function RowActions({ name, onEdit, onDelete, className = "" }: { name: string; onEdit: () => void; onDelete: () => void; className?: string }) {
	return (
		<div className={`flex shrink-0 gap-0.5 ${className}`}>
			<button type="button" className="key-icon" aria-label={`Edit ${name}`} onClick={onEdit}>
				<Pencil className="h-4 w-4" aria-hidden />
			</button>
			<button type="button" className="key-icon hover:bg-neg-soft hover:text-neg" aria-label={`Delete ${name}`} onClick={onDelete}>
				<Trash2 className="h-4 w-4" aria-hidden />
			</button>
		</div>
	);
}

const BudgetScreen = () => {
	const { status, budget, expenses, lastAdded, addBudgetEntry, updateBudgetEntry, deleteBudgetEntry } = useFinanceStore();
	const currency = usePreferencesStore((s) => s.currency);
	const play = usePrintOnce("budget");
	const fmt = (v: number) => formatCurrency(v, currency);

	// add
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedModal, setSelectedModal] = useState<BudgetBucket>("dailyNeeds");
	const [categoryInput, setCategoryInput] = useState("");
	const [descriptionInput, setDescriptionInput] = useState("");
	const [limitInput, setLimitInput] = useState("");
	const [addError, setAddError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// edit & delete
	const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
	const [editError, setEditError] = useState("");
	const [isEditLoading, setIsEditLoading] = useState(false);
	const [deletingEntry, setDeletingEntry] = useState<{ id: string; budgetSection: BudgetBucket; name: string } | null>(null);
	const [voidingId, setVoidingId] = useState<string | null>(null);

	const lines = useMemo(() => {
		const totals = expenseTotals(expenses);
		return Object.fromEntries(
			BUCKETS.map((b) => [
				b,
				budget[b].map((entry): Line => {
					const spent = spentOnLine(totals, b, entry.category);
					const limit = lineLimit(b, entry);
					return { entry, spent, limit, ...lineStatus(spent, limit) };
				}),
			])
		) as Record<BudgetBucket, Line[]>;
	}, [budget, expenses]);

	const bucketTotals = BUCKETS.map((b) => ({
		bucket: b,
		limit: lines[b].reduce((s, l) => s + l.limit, 0),
		spent: lines[b].reduce((s, l) => s + l.spent, 0),
		count: lines[b].length,
	}));
	const allLimit = bucketTotals.reduce((s, t) => s + t.limit, 0);
	const allSpent = bucketTotals.reduce((s, t) => s + t.spent, 0);
	const lineCount = bucketTotals.reduce((s, t) => s + t.count, 0);

	const openAdd = (bucket: BudgetBucket, name = "") => {
		setSelectedModal(bucket);
		setCategoryInput(name);
		setDescriptionInput("");
		setLimitInput("");
		setAddError("");
		setIsModalOpen(true);
	};

	// Ring up links here with ?add=<bucket> when a bucket has no lines yet.
	useEffect(() => {
		const add = new URLSearchParams(window.location.search).get("add");
		if (add && (BUCKETS as string[]).includes(add)) {
			openAdd(add as BudgetBucket);
			window.history.replaceState(null, "", window.location.pathname);
		}
	}, []);

	const addCategory = async () => {
		const label = BUCKET_EXPENSE_KEY[selectedModal];
		const limit = plainAmount(limitInput);

		if (selectedModal !== "plannedPayments") {
			if (!categoryInput.trim() || !descriptionInput.trim() || isNaN(Number(limit)) || Number(limit) <= 0) {
				setAddError("All fields are required and amount must be a valid number");
				return;
			}
		} else if (!categoryInput.trim() || !limit.trim()) {
			setAddError("All fields are required and amount must be a valid number");
			return;
		}

		const newCategoryName = categoryInput.trim().toLowerCase();
		if (budget[selectedModal].some((e) => e.category.toLowerCase() === newCategoryName)) {
			setAddError(`A "${newCategoryName}" category already exists in ${label}`);
			return;
		}

		setAddError("");
		setIsLoading(true);
		try {
			await addBudgetEntry(selectedModal, {
				category: categoryInput,
				description: descriptionInput,
				amount: limit,
				setLimit: limit,
			});
			toast.success(`${label} entry added successfully`);
			setIsModalOpen(false);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);
		}
	};

	const updateEntry = async () => {
		if (!editingEntry) return;
		const updates: Record<string, string | number> = { category: editingEntry.category.trim() };

		if (editingEntry.budgetSection === "plannedPayments") {
			const amount = plainAmount(editingEntry.amount);
			if (isNaN(Number(amount)) || Number(amount) <= 0) {
				setEditError("Amount must be a valid positive number");
				return;
			}
			updates.amount = Number(amount);
		} else {
			const setLimit = plainAmount(editingEntry.setLimit);
			if (!editingEntry.description.trim()) {
				setEditError("Description is required");
				return;
			}
			if (isNaN(Number(setLimit)) || Number(setLimit) <= 0) {
				setEditError("Limit must be a valid positive number");
				return;
			}
			updates.description = editingEntry.description.trim();
			updates.setLimit = Number(setLimit);
		}

		setEditError("");
		setIsEditLoading(true);
		try {
			await updateBudgetEntry(editingEntry.budgetSection, editingEntry.id, updates);
			toast.success("Entry updated");
			setEditingEntry(null);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsEditLoading(false);
		}
	};

	const deleteEntry = async () => {
		if (!deletingEntry) return;
		const target = deletingEntry;
		setDeletingEntry(null);
		setVoidingId(target.id);
		try {
			await deleteBudgetEntry(target.budgetSection, target.id);
			toast.success("Entry deleted");
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setVoidingId(null);
		}
	};

	return (
		<div className="page">
			<PageHeader title="Budget">
				{status !== "ready" ? (
					"Loading your limits…"
				) : lineCount ? (
					<>
						<span className="num text-ink">{fmt(allSpent)}</span> spent of <span className="num text-ink">{fmt(allLimit)}</span> across{" "}
						{lineCount} {lineCount === 1 ? "line" : "lines"}.
					</>
				) : (
					"Give each kind of spending a limit. Every spend you ring up is measured against one."
				)}
			</PageHeader>

			{status !== "ready" ? (
				<div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading budget">
					{[0, 1, 2].map((k) => (
						<div key={k} className="slip p-5">
							<div className="skeleton h-3.5 w-36" />
							<div className="mt-5 space-y-3">
								<div className="skeleton h-3 w-full" />
								<div className="skeleton h-3 w-5/6" />
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col gap-6">
					{/* Bucket overview */}
					{lineCount > 0 && (
						<PrintIn as="section" aria-labelledby="buckets-title" play={play} lines={10} className="slip px-4 py-4 md:px-5">
							<h2 id="buckets-title" className="sr-only">
								Buckets at a glance
							</h2>
							<ul className="grid gap-4 md:grid-cols-3 md:gap-6">
								{bucketTotals.map((t) => (
									<li key={t.bucket}>
										<a href={`#bucket-${t.bucket}`} className="group block rounded-[4px]">
											<span className="flex items-center gap-2 text-[14px] text-ink-2 group-hover:text-ink">
												<span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: BUCKET_INK[t.bucket] }} aria-hidden />
												{BUCKET_LABEL[t.bucket]}
											</span>
											<span className="mt-1 block font-mono text-[14px] tabular-nums text-ink">
												{fmt(t.spent)} <span className="text-ink-3">/ {fmt(t.limit)}</span>
											</span>
											<SegmentMeter spent={t.spent} limit={t.limit} segments={28} className="mt-2" delay={play ? 0.3 : 0} />
										</a>
									</li>
								))}
							</ul>
						</PrintIn>
					)}

					{BUCKETS.map((bucket, bi) => {
						const rows = lines[bucket];
						const t = bucketTotals[bi];
						return (
							<PrintIn
								key={bucket}
								as="section"
								id={`bucket-${bucket}`}
								aria-labelledby={`bucket-${bucket}-title`}
								play={play}
								delay={0.1 + bi * 0.1}
								lines={16}
								className="slip scroll-mt-24"
							>
								<div className="flex flex-col gap-3 px-4 pb-3 pt-4 md:flex-row md:items-start md:justify-between md:px-5">
									<div className="min-w-0">
										<h2 id={`bucket-${bucket}-title`} className="flex items-center gap-2.5 font-mono text-[15px] font-bold uppercase tracking-[0.06em]">
											<span className="h-3 w-3 rounded-[2px]" style={{ background: BUCKET_INK[bucket] }} aria-hidden />
											{BUCKET_LABEL[bucket]}
											{rows.length > 0 && <span className="tag">{rows.length}</span>}
										</h2>
										<p className="mt-1 text-[14px] text-ink-3">{BUCKET_HINT[bucket]}</p>
									</div>
									<button type="button" className="key-plain self-start" onClick={() => openAdd(bucket)}>
										<Plus className="h-4 w-4" aria-hidden strokeWidth={2.5} />
										New line
									</button>
								</div>

								{rows.length > 0 ? (
									<>
										<div className={`hidden border-y border-dashed border-rule-2 px-5 py-2 ${COLS}`} aria-hidden>
											<span className="label">Line</span>
											<span className="label text-right">Limit</span>
											<span className="label text-right">Spent</span>
											<span className="label">Status</span>
											<span />
										</div>
										<div className="rule-dash mx-4 md:hidden" aria-hidden />
										<ul aria-label={`${BUCKET_LABEL[bucket]} lines`}>
											<AnimatePresence initial={false}>
												{rows.map((line) => (
													<BudgetRow
														key={line.entry.id}
														line={line}
														fresh={lastAdded?.kind === "budget" && lastAdded.id === line.entry.id && Date.now() - lastAdded.at < 4000}
														voiding={voidingId === line.entry.id}
														onEdit={() => {
															setEditError("");
															setEditingEntry({
																id: line.entry.id,
																budgetSection: bucket,
																category: line.entry.category,
																description: line.entry.description ?? "",
																amount: bucket === "plannedPayments" ? groupAmount(String(line.entry.amount)) : "",
																setLimit: bucket === "plannedPayments" ? "" : groupAmount(String(line.entry.setLimit)),
															});
														}}
														onDelete={() => setDeletingEntry({ id: line.entry.id, budgetSection: bucket, name: line.entry.category })}
													/>
												))}
											</AnimatePresence>
										</ul>
										<div className="flex items-center justify-between border-t border-dashed border-rule-2 px-4 py-3 font-mono text-[13px] md:px-5">
											<span className="font-semibold uppercase tracking-[0.08em] text-ink-2">Subtotal</span>
											<span className="tabular-nums">
												<span className={t.spent > t.limit ? "text-neg" : "text-ink"}>{fmt(t.spent)}</span>
												<span className="text-ink-3"> / {fmt(t.limit)}</span>
											</span>
										</div>
									</>
								) : (
									<div className="border-t border-dashed border-rule-2 px-4 pb-2 md:px-5">
										<EmptySlip
											title={`No ${BUCKET_LABEL[bucket].toLowerCase()} lines`}
											ghosts={BUCKET_SUGGESTIONS[bucket].slice(0, 2).map((s) => ({ label: s }))}
											actions={
												<>
													<span className="sr-only">Start with:</span>
													{BUCKET_SUGGESTIONS[bucket].map((s) => (
														<button key={s} type="button" className="key-plain min-h-10 normal-case tracking-normal" onClick={() => openAdd(bucket, s)}>
															<Plus className="h-3.5 w-3.5" aria-hidden />
															<span className="capitalize">{s}</span>
														</button>
													))}
												</>
											}
										>
											{bucket === "others"
												? "Somewhere for spending that doesn't fit the other buckets. Pick a starter below or name your own with New line."
												: "Pick a starter below or name your own with New line. You can change the limit any time."}
										</EmptySlip>
									</div>
								)}
							</PrintIn>
						);
					})}
				</div>
			)}

			{/* Add line */}
			<AccessibleDialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={`New ${BUCKET_LABEL[selectedModal].toLowerCase()} line`}
				titleId="budget-modal-title"
				variant="responsive"
			>
				<form
					className="flex flex-col gap-4"
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						addCategory();
					}}
				>
					<div>
						<label htmlFor="category" className="field-label">
							Line name
						</label>
						<input
							className="field"
							type="text"
							id="category"
							placeholder={`e.g. ${BUCKET_SUGGESTIONS[selectedModal][0]}`}
							value={categoryInput}
							onChange={(e) => setCategoryInput(e.target.value)}
						/>
					</div>

					{selectedModal !== "plannedPayments" && (
						<div>
							<label htmlFor="description" className="field-label">
								Description
							</label>
							<textarea
								className="field max-h-32 min-h-[4.5rem]"
								id="description"
								placeholder="What counts as this line?"
								value={descriptionInput}
								onChange={(e) => setDescriptionInput(e.target.value)}
							/>
						</div>
					)}

					<div>
						<label htmlFor="set-limit" className="field-label">
							{selectedModal === "plannedPayments" ? "Amount" : "Limit"}
						</label>
						<AmountInput id="set-limit" value={limitInput} onChange={setLimitInput} currency={currency} size="md" />
					</div>

					{addError && (
						<p role="alert" className="text-[14px] font-medium text-neg">
							{addError}
						</p>
					)}

					<button type="submit" className="key-enter mt-1 min-h-12 w-full" disabled={isLoading}>
						{isLoading ? "Adding…" : "Add line"}
					</button>
				</form>
			</AccessibleDialog>

			{/* Edit line */}
			<AccessibleDialog
				open={!!editingEntry}
				onClose={() => setEditingEntry(null)}
				title="Edit line"
				titleId="budget-edit-dialog-title"
				variant="responsive"
			>
				{editingEntry && (
					<form
						className="flex flex-col gap-4"
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							updateEntry();
						}}
					>
						<div>
							<label htmlFor="edit-category" className="field-label">
								Line name
							</label>
							<input
								className="field"
								type="text"
								id="edit-category"
								value={editingEntry.category}
								onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
							/>
							<p className="field-hint">Spends already logged stay under the old name.</p>
						</div>

						{editingEntry.budgetSection !== "plannedPayments" && (
							<div>
								<label htmlFor="edit-description" className="field-label">
									Description
								</label>
								<textarea
									className="field max-h-32 min-h-[4.5rem]"
									id="edit-description"
									value={editingEntry.description}
									onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
								/>
							</div>
						)}

						<div>
							<label htmlFor="edit-limit" className="field-label">
								{editingEntry.budgetSection === "plannedPayments" ? "Amount" : "Limit"}
							</label>
							<AmountInput
								id="edit-limit"
								size="md"
								currency={currency}
								value={editingEntry.budgetSection === "plannedPayments" ? editingEntry.amount : editingEntry.setLimit}
								onChange={(v) =>
									setEditingEntry(
										editingEntry.budgetSection === "plannedPayments" ? { ...editingEntry, amount: v } : { ...editingEntry, setLimit: v }
									)
								}
							/>
						</div>

						{editError && (
							<p role="alert" className="text-[14px] font-medium text-neg">
								{editError}
							</p>
						)}

						<button type="submit" className="key-enter mt-1 min-h-12 w-full" disabled={isEditLoading}>
							{isEditLoading ? "Saving…" : "Save changes"}
						</button>
					</form>
				)}
			</AccessibleDialog>

			{/* Delete line */}
			<AccessibleDialog
				open={!!deletingEntry}
				onClose={() => setDeletingEntry(null)}
				title="Delete this line?"
				titleId="budget-delete-dialog-title"
			>
				<p className="text-[15px] leading-relaxed text-ink-2">
					<span className="font-semibold capitalize text-ink">{deletingEntry?.name}</span> and its limit will be removed permanently.
					Spends already logged against it are kept.
				</p>
				<div className="mt-6 grid grid-cols-2 gap-3">
					<button type="button" className="key-plain" onClick={() => setDeletingEntry(null)}>
						Cancel
					</button>
					<button type="button" className="key-void" onClick={deleteEntry}>
						Delete
					</button>
				</div>
			</AccessibleDialog>
		</div>
	);
};

export default BudgetScreen;
