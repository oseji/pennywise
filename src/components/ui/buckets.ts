import type { BudgetBucket } from "@/lib/finance/types";

/** Process-ink identity per bucket, used identically in every chart, swatch and meter. */
export const BUCKET_INK: Record<BudgetBucket, string> = {
	dailyNeeds: "rgb(var(--chart-daily))",
	plannedPayments: "rgb(var(--chart-planned))",
	others: "rgb(var(--chart-others))",
};

export const BUCKET_HINT: Record<BudgetBucket, string> = {
	dailyNeeds: "Food, transport, data — the everyday.",
	plannedPayments: "Rent, bills and subscriptions you know are coming.",
	others: "Spending that doesn't fit the other two.",
};

export const BUCKET_SUGGESTIONS: Record<BudgetBucket, string[]> = {
	dailyNeeds: ["groceries", "transport", "data & airtime", "eating out"],
	plannedPayments: ["rent", "electricity", "subscriptions", "school fees"],
	others: ["gifts", "repairs", "emergencies"],
};
