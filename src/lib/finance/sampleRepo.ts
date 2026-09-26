// In-memory stand-in for Firestore, used only by the dev sample mode. Writes
// live until reload, so the ring-up, edit and delete flows can be exercised
// without touching a real account.
import { formatMoney } from "@/utils/formatMoney";
import { formatStamp } from "./dates";
import { createSampleData } from "./fixtures";
import type { BudgetData, FinanceRepo, NotificationEntry } from "./types";
import type { SampleMode } from "./sampleMode";

const LATENCY = 380;
const wait = () => new Promise((r) => setTimeout(r, LATENCY * (0.7 + Math.random() * 0.6)));

let db: ReturnType<typeof createSampleData> | null = null;
let variant: SampleMode = "full";
const data = () =>
	(db ??=
		variant === "empty"
			? { income: [], expenses: [], budget: { dailyNeeds: [], plannedPayments: [], others: [] } }
			: createSampleData());

export function setSampleVariant(v: SampleMode) {
	if (v !== variant) {
		db = null;
		notifications = null;
	}
	variant = v;
}
let notifications: NotificationEntry[] | null = null;

/** Activity seeded once from the newest entries; the three most recent start unread. */
function feed(): NotificationEntry[] {
	if (notifications) return notifications;
	notifications = [...data().income, ...data().expenses]
		.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
		.slice(0, 8)
		.map((e, i) => ({
			id: `ntf-${i}`,
			date: e.date,
			notification:
				"subCategory" in e
					? `${formatMoney(e.amount, "NGN")} was added to Expenses under ${e.category} — ${e.subCategory}`
					: `${formatMoney(e.amount, "NGN")} was added to Income under ${e.category}`,
			category: e.category,
			amount: e.amount,
			read: i >= 3,
			createdAt: e.createdAt,
		}));
	return notifications;
}
let seq = 0;
const newId = (p: string) => `${p}-new-${++seq}`;
const clone = <T,>(x: T): T => structuredClone(x);

export const sampleRepo: FinanceRepo = {
	async fetchIncome() {
		await wait();
		return clone(data().income);
	},
	async addIncome(_uid, { narration, category, amount }, currency) {
		await wait();
		const createdAt = new Date();
		const id = newId("inc");
		data().income.unshift({ id, narration, category, amount: Number(amount), date: formatStamp(createdAt), createdAt });
		feed().unshift({
			id: newId("ntf"),
			read: false,
			createdAt,
			date: formatStamp(createdAt),
			notification: `${formatMoney(Number(amount), currency)} was added to Income under ${category}`,
			category,
			amount: Number(amount),
		});
		return id;
	},
	async deleteIncome(_uid, id) {
		await wait();
		data().income = data().income.filter((e) => e.id !== id);
	},

	async fetchExpenses() {
		await wait();
		return clone(data().expenses);
	},
	async addExpense(_uid, { category, subCategory, narration, amount }, currency) {
		await wait();
		const createdAt = new Date();
		const id = newId("exp");
		data().expenses.unshift({ id, category, subCategory, narration, amount: Number(amount), date: formatStamp(createdAt), createdAt });
		feed().unshift({
			id: newId("ntf"),
			read: false,
			createdAt,
			date: formatStamp(createdAt),
			notification: `${formatMoney(Number(amount), currency)} was added to Expenses under ${category} — ${subCategory}`,
			category,
			amount: Number(amount),
		});
		return id;
	},
	async deleteExpense(_uid, id) {
		await wait();
		data().expenses = data().expenses.filter((e) => e.id !== id);
	},

	async fetchBudget() {
		await wait();
		return clone(data().budget) as BudgetData;
	},
	async addBudgetEntry(_uid, bucket, { category, description, amount, setLimit }) {
		await wait();
		const createdAt = new Date();
		const id = newId("bud");
		const planned = bucket === "plannedPayments";
		data().budget[bucket].unshift({
			id,
			category,
			description: planned ? "" : description,
			amount: planned ? Number(amount) || 0 : 0,
			setLimit: planned ? 0 : Number(setLimit) || 0,
			budgetValue: planned ? Number(amount) || 0 : Number(setLimit) || 0,
			date: formatStamp(createdAt),
			createdAt,
		});
		return id;
	},
	async updateBudgetEntry(_uid, bucket, id, updates) {
		await wait();
		const entry = data().budget[bucket].find((e) => e.id === id);
		if (!entry) return;
		Object.assign(entry, updates);
		entry.budgetValue = bucket === "plannedPayments" ? entry.amount : entry.setLimit;
	},
	async deleteBudgetEntry(_uid, bucket, id) {
		await wait();
		data().budget[bucket] = data().budget[bucket].filter((e) => e.id !== id);
	},

	async fetchNotifications() {
		await wait();
		return clone(feed());
	},
	async setNotificationRead(_uid, id, read) {
		await wait();
		const n = feed().find((x) => x.id === id);
		if (n) n.read = read;
	},
	async markNotificationsRead(_uid, ids) {
		await wait();
		feed().forEach((n) => {
			if (ids.includes(n.id)) n.read = true;
		});
	},
};
