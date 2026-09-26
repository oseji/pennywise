import { create } from "zustand";
import toast from "react-hot-toast";
import { firestoreRepo } from "@/lib/finance/firestore";
import type { SampleMode } from "@/lib/finance/sampleMode";
import { formatFetchError } from "@/utils/formatFetchError";
import type { CurrencyCode } from "@/store/usePreferencesStore";
import type {
	BudgetBucket,
	BudgetData,
	ExpenseEntry,
	FinanceRepo,
	IncomeEntry,
	NewBudgetEntry,
	NewExpense,
	NewIncome,
	NotificationEntry,
} from "@/lib/finance/types";
import { formatAddDocError } from "@/utils/formatAddDocError";

type Status = "idle" | "loading" | "ready";
type Kind = "income" | "expense" | "budget";

type FinanceState = {
	status: Status;
	sample: SampleMode | null;
	uid: string | null;
	income: IncomeEntry[];
	expenses: ExpenseEntry[];
	budget: BudgetData;
	notifications: NotificationEntry[];
	/** Most recent write, so lists can mark the row that just landed. */
	lastAdded: { kind: Kind; id: string; at: number } | null;

	start: (uid: string | null, sample: SampleMode | null) => Promise<void>;
	reload: (what: Kind) => Promise<void>;

	addIncome: (input: NewIncome, currency: CurrencyCode) => Promise<string>;
	addExpense: (input: NewExpense, currency: CurrencyCode) => Promise<string>;
	deleteIncome: (id: string) => Promise<void>;
	deleteExpense: (id: string) => Promise<void>;
	addBudgetEntry: (bucket: BudgetBucket, input: NewBudgetEntry) => Promise<string>;
	updateBudgetEntry: (bucket: BudgetBucket, id: string, updates: Record<string, string | number>) => Promise<void>;
	deleteBudgetEntry: (bucket: BudgetBucket, id: string) => Promise<void>;

	reloadNotifications: () => Promise<void>;
	setNotificationRead: (id: string, read: boolean) => Promise<void>;
	markAllNotificationsRead: () => Promise<void>;
};

const EMPTY_BUDGET: BudgetData = { dailyNeeds: [], plannedPayments: [], others: [] };

let repo: FinanceRepo = firestoreRepo;

async function resolveRepo(sample: SampleMode | null): Promise<FinanceRepo> {
	// inline NODE_ENV (not SAMPLE_MODE_AVAILABLE) so production builds drop the fixtures chunk entirely
	if (process.env.NODE_ENV === "development" && sample) {
		const mod = await import("@/lib/finance/sampleRepo");
		mod.setSampleVariant(sample);
		return mod.sampleRepo;
	}
	return firestoreRepo;
}

// Each list is fetched on its own so one failure doesn't blank the others,
// and errors surface through the same toast copy the pages used.
async function safe<T>(p: Promise<T>): Promise<T | undefined> {
	try {
		return await p;
	} catch (err) {
		toast.error(formatFetchError(err));
		return undefined;
	}
}

export const useFinanceStore = create<FinanceState>((set, get) => {
	const userId = () => get().uid ?? "sample";

	return {
		status: "idle",
		sample: null,
		uid: null,
		income: [],
		expenses: [],
		budget: EMPTY_BUDGET,
		notifications: [],
		lastAdded: null,

		start: async (uid, sample) => {
			const s = get();
			if (s.status !== "idle" && s.uid === uid && s.sample === sample) return;

			set({ status: "loading", uid, sample, income: [], expenses: [], budget: EMPTY_BUDGET, notifications: [], lastAdded: null });
			repo = await resolveRepo(sample);
			if (!uid && !sample) {
				set({ status: "ready" });
				return;
			}

			const id = uid ?? "sample";
			const [income, expenses, budget, notifications] = await Promise.all([
				safe(repo.fetchIncome(id)),
				safe(repo.fetchExpenses(id)),
				safe(repo.fetchBudget(id)),
				safe(repo.fetchNotifications(id)),
			]);
			// a newer start() (sign-out, sample toggle) wins
			if (get().uid !== uid || get().sample !== sample) return;
			set({
				status: "ready",
				income: income ?? [],
				expenses: expenses ?? [],
				budget: budget ?? EMPTY_BUDGET,
				notifications: notifications ?? [],
			});
		},

		reload: async (what) => {
			const id = userId();
			if (what === "income") {
				const income = await safe(repo.fetchIncome(id));
				if (income) set({ income });
			} else if (what === "expense") {
				const expenses = await safe(repo.fetchExpenses(id));
				if (expenses) set({ expenses });
			} else {
				const budget = await safe(repo.fetchBudget(id));
				if (budget) set({ budget });
			}
		},

		addIncome: async (input, currency) => {
			const id = await repo.addIncome(userId(), input, currency);
			set({ lastAdded: { kind: "income", id, at: Date.now() } });
			await Promise.all([get().reload("income"), get().reloadNotifications()]);
			return id;
		},

		addExpense: async (input, currency) => {
			const id = await repo.addExpense(userId(), input, currency);
			set({ lastAdded: { kind: "expense", id, at: Date.now() } });
			await Promise.all([get().reload("expense"), get().reloadNotifications()]);
			return id;
		},

		deleteIncome: async (id) => {
			await repo.deleteIncome(userId(), id);
			await get().reload("income");
		},

		deleteExpense: async (id) => {
			await repo.deleteExpense(userId(), id);
			await get().reload("expense");
		},

		addBudgetEntry: async (bucket, input) => {
			const id = await repo.addBudgetEntry(userId(), bucket, input);
			set({ lastAdded: { kind: "budget", id, at: Date.now() } });
			await get().reload("budget");
			return id;
		},

		updateBudgetEntry: async (bucket, id, updates) => {
			await repo.updateBudgetEntry(userId(), bucket, id, updates);
			await get().reload("budget");
		},

		deleteBudgetEntry: async (bucket, id) => {
			await repo.deleteBudgetEntry(userId(), bucket, id);
			await get().reload("budget");
		},

		reloadNotifications: async () => {
			if (!get().uid && !get().sample) return;
			const notifications = await safe(repo.fetchNotifications(userId()));
			if (notifications) set({ notifications });
		},

		// Read state updates optimistically so the badge responds at once, and rolls back on failure.
		setNotificationRead: async (id, read) => {
			const before = get().notifications;
			set({ notifications: before.map((n) => (n.id === id ? { ...n, read } : n)) });
			try {
				await repo.setNotificationRead(userId(), id, read);
			} catch (err) {
				set({ notifications: before });
				toast.error(formatAddDocError(err));
			}
		},

		markAllNotificationsRead: async () => {
			const before = get().notifications;
			const ids = before.filter((n) => !n.read).map((n) => n.id);
			if (!ids.length) return;
			set({ notifications: before.map((n) => ({ ...n, read: true })) });
			try {
				await repo.markNotificationsRead(userId(), ids);
			} catch (err) {
				set({ notifications: before });
				toast.error(formatAddDocError(err));
			}
		},
	};
});

export const selectUnreadCount = (s: FinanceState) => s.notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0);
