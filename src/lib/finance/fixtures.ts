// Synthetic data for the dev-only sample mode. Nothing here is real.
// Budget line names are lowercase on purpose: the budget page matches expenses
// to lines case-sensitively (see spentOnLine in derive.ts), so lowercase names
// are the ones that show their spend today.
import { formatStamp } from "./dates";
import type { BudgetBucket, BudgetData, BudgetEntry, ExpenseEntry, IncomeEntry } from "./types";
import { BUCKET_EXPENSE_KEY } from "./types";

type Line = {
	bucket: BudgetBucket;
	name: string;
	description: string;
	limit: number;
	/** Share of the limit spent across the six months. */
	spent: number;
	narrations: string[];
	/** Spread evenly, or as one payment in the first month. */
	pattern?: "even" | "once";
};

const LINES: Line[] = [
	{ bucket: "dailyNeeds", name: "groceries", description: "Market runs and the weekly shop", limit: 360_000, spent: 0.8, narrations: ["Weekly shop", "Mile 12 market run", "Fruit and veg", "Rice, oil, tomatoes"] },
	{ bucket: "dailyNeeds", name: "transport", description: "Fuel, ride-hailing and bus fares", limit: 150_000, spent: 0.68, narrations: ["Ride to the office", "Fuel top-up", "Bus card top-up", "Ride home, late"] },
	{ bucket: "dailyNeeds", name: "data & airtime", description: "Phone data bundles and airtime", limit: 45_000, spent: 1.1, narrations: ["20GB data bundle", "Airtime top-up", "Router data renewal"] },
	{ bucket: "dailyNeeds", name: "eating out", description: "Lunch at work, weekend suya", limit: 90_000, spent: 0.68, narrations: ["Lunch near the office", "Suya with friends", "Friday small chops"] },
	{ bucket: "plannedPayments", name: "rent", description: "", limit: 900_000, spent: 1, narrations: ["Annual rent, flat 3B"], pattern: "once" },
	{ bucket: "plannedPayments", name: "electricity", description: "", limit: 90_000, spent: 0.8, narrations: ["Prepaid meter token"] },
	{ bucket: "plannedPayments", name: "subscriptions", description: "", limit: 36_000, spent: 0.83, narrations: ["Music streaming", "Video streaming", "Cloud storage"] },
	{ bucket: "plannedPayments", name: "gym", description: "", limit: 60_000, spent: 0, narrations: [] },
	{ bucket: "others", name: "gifts", description: "Birthdays, weddings and owambe", limit: 80_000, spent: 1.19, narrations: ["Wedding gift", "Mum's birthday", "Baby shower"] },
	{ bucket: "others", name: "repairs", description: "Phone screen, car service", limit: 120_000, spent: 0.37, narrations: ["Phone screen replacement", "Car service"] },
];

const INCOME: { category: string; narration: string; amount: number; months: number[]; day: number }[] = [
	{ category: "salary", narration: "Monthly salary", amount: 420_000, months: [0, 1, 2, 3, 4, 5], day: 25 },
	{ category: "allowance", narration: "Transport allowance", amount: 25_000, months: [0, 2, 4, 5], day: 5 },
	{ category: "gift", narration: "Birthday gift from Uncle Femi", amount: 50_000, months: [3], day: 14 },
	{ category: "petty cash", narration: "Sold old headphones", amount: 18_500, months: [1], day: 19 },
	{ category: "petty cash", narration: "Refund from a friend", amount: 12_000, months: [5], day: 9 },
];

// Deterministic so screenshots are repeatable.
function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

let seq = 0;
const id = (prefix: string) => `${prefix}-${(++seq).toString(36).padStart(4, "0")}`;

/** A date in month offset `m` (0 = five months ago, 5 = this month), never after `now`. */
function dateIn(now: Date, m: number, day: number, rand: () => number): Date {
	const d = new Date(now.getFullYear(), now.getMonth() - (5 - m), 1, 8 + Math.floor(rand() * 12), Math.floor(rand() * 60));
	const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
	d.setDate(Math.min(day, lastDay));
	if (d > now) d.setTime(now.getTime() - (1 + Math.floor(rand() * 5)) * 3_600_000);
	return d;
}

const round = (n: number, to = 50) => Math.max(to, Math.round(n / to) * to);

export function createSampleData(now = new Date()) {
	const rand = rng(20260926);

	const income: IncomeEntry[] = INCOME.flatMap((src) =>
		src.months.map((m) => {
			const createdAt = dateIn(now, m, src.day, rand);
			return {
				id: id("inc"),
				narration: src.narration,
				category: src.category,
				amount: src.amount,
				date: formatStamp(createdAt),
				createdAt,
			};
		})
	);

	const expenses: ExpenseEntry[] = [];
	const budget: BudgetData = { dailyNeeds: [], plannedPayments: [], others: [] };

	LINES.forEach((line, li) => {
		const created = dateIn(now, 0, 1 + li, rand);
		const entry: BudgetEntry = {
			id: id("bud"),
			category: line.name,
			description: line.description,
			amount: line.bucket === "plannedPayments" ? line.limit : 0,
			setLimit: line.bucket === "plannedPayments" ? 0 : line.limit,
			budgetValue: line.limit,
			date: formatStamp(created),
			createdAt: created,
		};
		budget[line.bucket].push(entry);

		const total = line.limit * line.spent;
		if (!total) return;

		const count = line.pattern === "once" ? 1 : 3 + Math.floor(rand() * 5);
		const weights = Array.from({ length: count }, () => 0.5 + rand());
		const sum = weights.reduce((a, b) => a + b, 0);
		let left = total;

		weights.forEach((w, i) => {
			const amount = i === count - 1 ? round(left) : round((total * w) / sum);
			left -= amount;
			const month = line.pattern === "once" ? 0 : Math.min(5, Math.floor((i / count) * 6 + rand() * 0.9));
			const createdAt = dateIn(now, month, 1 + Math.floor(rand() * 27), rand);
			expenses.push({
				id: id("exp"),
				category: BUCKET_EXPENSE_KEY[line.bucket],
				subCategory: line.name,
				narration: line.narrations[i % line.narrations.length],
				amount,
				date: formatStamp(createdAt),
				createdAt,
			});
		});
	});

	const byNewest = <T extends { createdAt: Date | null }>(a: T, b: T) =>
		(b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);

	income.sort(byNewest);
	expenses.sort(byNewest);
	(Object.keys(budget) as BudgetBucket[]).forEach((b) => budget[b].sort(byNewest));

	return { income, expenses, budget };
}
