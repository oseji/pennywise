// Pure read-side calculations.
//
// Section 1 is the existing maths, moved from the pages without changing a
// formula. Section 2 is new: read-only views over the same entries that the
// redesign introduces (cash flow by month, the journal, per-line spend
// ranking). Nothing here writes data.
import { monthKey } from "./dates";
import type {
	BudgetBucket,
	BudgetData,
	ExpenseEntry,
	IncomeEntry,
} from "./types";
import { BUCKET_EXPENSE_KEY, BUCKETS, bucketFromExpenseKey } from "./types";

// ─── 1. Existing calculations ───────────────────────────────────────────

export type CategorySummary = { name: string; percentage: number; totalAmount: number };
export type Summary = { total: number; categories: CategorySummary[] };

/** overview/page.tsx `summarize`: total and per-category share of income or expenses. */
export function summarizeByCategory(entries: { category: string; amount: number }[]): Summary {
	let total = 0;
	const byCat: Record<string, number> = {};

	entries.forEach((d) => {
		const cat = d.category as string;
		const amt = Number(d.amount) || 0;
		total += amt;
		byCat[cat] = (byCat[cat] || 0) + amt;
	});

	const categories: CategorySummary[] = Object.entries(byCat).map(([name, amount]) => ({
		name,
		totalAmount: amount,
		percentage: total ? parseFloat(((amount / total) * 100).toFixed(2)) : 0,
	}));

	return { total, categories };
}

/** overview/page.tsx `fetchBudgetData`: budget total per bucket (limit values summed). */
export function summarizeBudget(budget: BudgetData): Summary {
	const budgetCategories: BudgetBucket[] = ["others", "plannedPayments", "dailyNeeds"];
	let total = 0;
	const categories: CategorySummary[] = [];

	for (const cat of budgetCategories) {
		let catTotal = 0;
		budget[cat].forEach((d) => {
			catTotal += Number(d.budgetValue) || 0;
		});
		total += catTotal;
		categories.push({ name: cat, totalAmount: catTotal, percentage: 0 });
	}

	return {
		total,
		categories: categories.map((c) => ({
			...c,
			percentage: total ? parseFloat(((c.totalAmount / total) * 100).toFixed(2)) : 0,
		})),
	};
}

/** overview/page.tsx headline figures. */
export function headline(income: Summary, expense: Summary, budget: Summary) {
	const net = income.total - expense.total;
	const hasBudget = budget.total > 0;
	const budgetUsed = hasBudget ? Math.min((expense.total / budget.total) * 100, 100) : 0;
	const budgetRemaining = budget.total - expense.total;
	const overBudget = hasBudget && budgetRemaining < 0;
	return { net, hasBudget, budgetUsed, budgetRemaining, overBudget };
}

export type CategoryTotals = {
	[category: string]: {
		[subCategory: string]: { totalSpent: number; expenses: ExpenseEntry[] };
	};
};

/** budget/page.tsx `fetchExpensesWithTotals`: spend per bucket → line, keys lowercased. */
export function expenseTotals(expenses: ExpenseEntry[]): CategoryTotals {
	const totals: CategoryTotals = {};

	expenses.forEach((expense) => {
		const category = String(expense.category ?? "").toLowerCase();
		const subCategory = String(expense.subCategory ?? "").toLowerCase();
		const { amount } = expense;

		if (!totals[category]) totals[category] = {};
		if (!totals[category][subCategory]) {
			totals[category][subCategory] = { totalSpent: 0, expenses: [] };
		}
		totals[category][subCategory].totalSpent += amount;
		totals[category][subCategory].expenses.push(expense);
	});

	return totals;
}

/**
 * budget/page.tsx `getTotalForSubCategory`. The line name is looked up as
 * stored (not lowercased) — preserved as-is; flagged for review.
 */
export function spentOnLine(totals: CategoryTotals, bucket: BudgetBucket, lineName: string): number {
	return totals[BUCKET_EXPENSE_KEY[bucket]]?.[lineName]?.totalSpent ?? 0;
}

/** The limit a budget line is measured against (planned payments store it as `amount`). */
export const lineLimit = (bucket: BudgetBucket, entry: { amount: number; setLimit: number }) =>
	bucket === "plannedPayments" ? entry.amount ?? 0 : entry.setLimit;

/** budget/page.tsx `BudgetStatus`. */
export function lineStatus(spent: number, limit: number) {
	const percentage = limit > 0 ? (spent / limit) * 100 : 0;
	const over = spent - limit;
	const isOver = limit > 0 && over > 0;
	return { percentage, over, isOver };
}

// ─── 2. New read-only views ─────────────────────────────────────────────

export type MonthFlow = { key: string; label: string; year: number; income: number; spent: number; net: number };

/** Income and spend per calendar month for the last `months` months, oldest first. */
export function monthlyCashFlow(
	income: IncomeEntry[],
	expenses: ExpenseEntry[],
	months = 6,
	now = new Date()
): MonthFlow[] {
	const rows: MonthFlow[] = [];
	for (let i = months - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		rows.push({
			key: monthKey(d),
			label: d.toLocaleDateString("en-GB", { month: "short" }),
			year: d.getFullYear(),
			income: 0,
			spent: 0,
			net: 0,
		});
	}
	const byKey = new Map(rows.map((r) => [r.key, r]));
	income.forEach((e) => {
		const r = e.createdAt && byKey.get(monthKey(e.createdAt));
		if (r) r.income += e.amount;
	});
	expenses.forEach((e) => {
		const r = e.createdAt && byKey.get(monthKey(e.createdAt));
		if (r) r.spent += e.amount;
	});
	rows.forEach((r) => (r.net = r.income - r.spent));
	return rows;
}

export type SpendLine = { bucket: BudgetBucket | null; name: string; total: number; share: number };

/** Spend grouped by budget line across all buckets, largest first. */
export function spendByLine(expenses: ExpenseEntry[]): SpendLine[] {
	const map = new Map<string, SpendLine>();
	let grand = 0;
	expenses.forEach((e) => {
		const bucket = bucketFromExpenseKey(String(e.category ?? ""));
		const name = String(e.subCategory ?? "").toLowerCase();
		const key = `${bucket}:${name}`;
		const row = map.get(key) ?? { bucket, name, total: 0, share: 0 };
		row.total += e.amount;
		grand += e.amount;
		map.set(key, row);
	});
	return [...map.values()]
		.map((r) => ({ ...r, share: grand ? r.total / grand : 0 }))
		.sort((a, b) => b.total - a.total);
}

/** Spend per bucket, in fixed bucket order (for the part-to-whole bar). */
export function spendByBucket(expenses: ExpenseEntry[]) {
	const totals = Object.fromEntries(BUCKETS.map((b) => [b, 0])) as Record<BudgetBucket, number>;
	let other = 0;
	expenses.forEach((e) => {
		const b = bucketFromExpenseKey(String(e.category ?? ""));
		if (b) totals[b] += e.amount;
		else other += e.amount;
	});
	return { totals, other };
}

export type JournalEntry =
	| ({ kind: "income" } & IncomeEntry)
	| ({ kind: "expense" } & ExpenseEntry);

/** Income and expenses merged into one list, newest first. */
export function journal(income: IncomeEntry[], expenses: ExpenseEntry[]): JournalEntry[] {
	return [
		...income.map((e) => ({ kind: "income" as const, ...e })),
		...expenses.map((e) => ({ kind: "expense" as const, ...e })),
	].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

/** Share of income kept (net ÷ income). Null when there's no income to measure against. */
export const savingsRate = (incomeTotal: number, net: number) =>
	incomeTotal > 0 ? net / incomeTotal : null;
