import type { CurrencyCode } from "@/store/usePreferencesStore";

export type BudgetBucket = "dailyNeeds" | "plannedPayments" | "others";

export const BUCKETS: BudgetBucket[] = ["dailyNeeds", "plannedPayments", "others"];

export const BUCKET_LABEL: Record<BudgetBucket, string> = {
	dailyNeeds: "Daily needs",
	plannedPayments: "Planned payments",
	others: "Others",
};

// The value an expense document stores in `category` for each bucket.
export const BUCKET_EXPENSE_KEY: Record<BudgetBucket, string> = {
	dailyNeeds: "daily needs",
	plannedPayments: "planned payments",
	others: "others",
};

export const bucketFromExpenseKey = (key: string): BudgetBucket | null => {
	const k = key.toLowerCase();
	return BUCKETS.find((b) => BUCKET_EXPENSE_KEY[b] === k) ?? null;
};

export const INCOME_CATEGORIES = [
	{ value: "salary", label: "Salary" },
	{ value: "allowance", label: "Allowance" },
	{ value: "gift", label: "Gift" },
	{ value: "petty cash", label: "Petty Cash" },
] as const;

export type IncomeEntry = {
	id: string;
	narration: string;
	category: string;
	amount: number;
	/** Display string, formatted exactly as the pages always have. */
	date: string;
	createdAt: Date | null;
};

export type ExpenseEntry = {
	id: string;
	/** Bucket key as stored: "daily needs" | "planned payments" | "others". */
	category: string;
	/** The budget line's name. */
	subCategory: string;
	narration: string;
	amount: number;
	date: string;
	createdAt: Date | null;
};

export type BudgetEntry = {
	id: string;
	category: string;
	description: string;
	/** Planned payments keep their limit here. */
	amount: number;
	/** Daily needs and Others keep their limit here. */
	setLimit: number;
	/** `amount ?? setLimit` on the raw document — what the dashboard's budget total sums. */
	budgetValue: number;
	date: string;
	createdAt: Date | null;
};

export type BudgetData = Record<BudgetBucket, BudgetEntry[]>;

export type NotificationEntry = {
	id: string;
	date: string;
	notification: string;
	category: string;
	amount: number;
	/** Documents written before read tracking have no `read` field and count as unread. */
	read: boolean;
	createdAt: Date | null;
};

export type NewIncome = { narration: string; category: string; amount: string };
export type NewExpense = { category: string; subCategory: string; narration: string; amount: string };
export type NewBudgetEntry = { category: string; description: string; amount: string; setLimit: string };

export interface FinanceRepo {
	fetchIncome(userId: string): Promise<IncomeEntry[]>;
	addIncome(userId: string, input: NewIncome, currency: CurrencyCode): Promise<string>;
	deleteIncome(userId: string, id: string): Promise<void>;

	fetchExpenses(userId: string): Promise<ExpenseEntry[]>;
	addExpense(userId: string, input: NewExpense, currency: CurrencyCode): Promise<string>;
	deleteExpense(userId: string, id: string): Promise<void>;

	fetchBudget(userId: string): Promise<BudgetData>;
	addBudgetEntry(userId: string, bucket: BudgetBucket, input: NewBudgetEntry): Promise<string>;
	updateBudgetEntry(
		userId: string,
		bucket: BudgetBucket,
		id: string,
		updates: Record<string, string | number>
	): Promise<void>;
	deleteBudgetEntry(userId: string, bucket: BudgetBucket, id: string): Promise<void>;

	fetchNotifications(userId: string): Promise<NotificationEntry[]>;
	setNotificationRead(userId: string, id: string, read: boolean): Promise<void>;
	markNotificationsRead(userId: string, ids: string[]): Promise<void>;
}
