// Every Firestore read and write in the app lives here. Each function was
// moved out of the page that used to own it (overview, income, expenses,
// budget, Notifications) with the same paths, queries, document fields and
// notification text. Additions: fetches also keep `createdAt` as a Date so
// the UI can group by day and month, and notifications gained a `read` flag
// (see "Read state" at the bottom).
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	writeBatch,
	type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { formatMoney } from "@/utils/formatMoney";
import { formatStamp } from "./dates";
import type {
	BudgetBucket,
	BudgetData,
	ExpenseEntry,
	FinanceRepo,
	IncomeEntry,
	NotificationEntry,
} from "./types";

const formatEntryDate = (createdAt: Timestamp | undefined): string =>
	(createdAt && formatStamp(createdAt.toDate())) || "";

const toDate = (createdAt: Timestamp | undefined): Date | null => createdAt?.toDate() ?? null;

export const firestoreRepo: FinanceRepo = {
	// ─── Income (was income/page.tsx) ───
	async fetchIncome(userId) {
		const incomeReference = collection(db, `users/${userId}/incomeData`);
		const q = query(incomeReference, orderBy("createdAt", "desc"));
		const querySnapshot = await getDocs(q);

		return querySnapshot.docs.map((docSnap): IncomeEntry => {
			const data = docSnap.data();
			return {
				date: formatEntryDate(data.createdAt),
				narration: data.narration || "",
				category: data.category,
				amount: Number(data.amount) || 0,
				id: docSnap.id,
				createdAt: toDate(data.createdAt),
			};
		});
	},

	async addIncome(userId, { narration, category, amount }, currency) {
		const newDocRef = doc(collection(db, `users/${userId}/incomeData`));

		await setDoc(newDocRef, {
			id: newDocRef.id,
			narration,
			category,
			amount: Number(amount),
			createdAt: serverTimestamp(),
		});

		await addDoc(collection(db, `users/${userId}/notifications`), {
			notification: `${formatMoney(Number(amount), currency)} was added to Income under ${category}`,
			category,
			amount: Number(amount),
			createdAt: serverTimestamp(),
		});

		return newDocRef.id;
	},

	async deleteIncome(userId, id) {
		await deleteDoc(doc(db, `users/${userId}/incomeData/${id}`));
	},

	// ─── Expenses (was expenses/page.tsx) ───
	async fetchExpenses(userId) {
		const expenseReference = collection(db, `users/${userId}/expenseData`);
		const q = query(expenseReference, orderBy("createdAt", "desc"));
		const querySnapshot = await getDocs(q);

		return querySnapshot.docs.map((docSnap): ExpenseEntry => {
			const data = docSnap.data();
			return {
				category: data.category,
				subCategory: data.subCategory,
				date: formatEntryDate(data.createdAt),
				narration: data.narration || "",
				amount: Number(data.amount) || 0,
				id: docSnap.id,
				createdAt: toDate(data.createdAt),
			};
		});
	},

	async addExpense(userId, { category, subCategory, narration, amount }, currency) {
		const ref = await addDoc(collection(db, `users/${userId}/expenseData`), {
			category,
			subCategory,
			narration,
			amount: Number(amount),
			createdAt: serverTimestamp(),
		});

		await addDoc(collection(db, `users/${userId}/notifications`), {
			notification: `${formatMoney(Number(amount), currency)} was added to Expenses under ${category} — ${subCategory}`,
			category,
			amount: Number(amount),
			createdAt: serverTimestamp(),
		});

		return ref.id;
	},

	async deleteExpense(userId, id) {
		await deleteDoc(doc(db, `users/${userId}/expenseData/${id}`));
	},

	// ─── Budget (was budget/page.tsx; budgetValue from overview/page.tsx) ───
	async fetchBudget(userId) {
		const fetchCategory = async (category: BudgetBucket) => {
			const ref = collection(db, `users/${userId}/budgetData/${category}/data`);
			const q = query(ref, orderBy("createdAt", "desc"));
			const snapshot = await getDocs(q);

			return snapshot.docs.map((docSnap) => {
				const data = docSnap.data();
				return {
					id: docSnap.id,
					date: formatEntryDate(data.createdAt),
					category: data.category,
					description: data.description || "",
					amount: Number(data.amount) || 0,
					setLimit: Number(data.setLimit) || 0,
					// The overview read these docs unordered and summed `amount ?? setLimit`;
					// every budget doc is written with createdAt, so the ordered query sees the same set.
					budgetValue: Number(data.amount ?? data.setLimit ?? 0) || 0,
					createdAt: toDate(data.createdAt),
				};
			});
		};

		const [dailyNeeds, plannedPayments, others] = await Promise.all([
			fetchCategory("dailyNeeds"),
			fetchCategory("plannedPayments"),
			fetchCategory("others"),
		]);

		return { dailyNeeds, plannedPayments, others } satisfies BudgetData;
	},

	async addBudgetEntry(userId, bucket, { category, description, amount, setLimit }) {
		const ref = await addDoc(collection(db, `users/${userId}/budgetData/${bucket}/data`), {
			createdAt: serverTimestamp(),
			category,
			description: bucket === "plannedPayments" ? null : description,
			amount: bucket === "plannedPayments" ? Number(amount) : null,
			setLimit: bucket === "plannedPayments" ? null : Number(setLimit),
		});
		return ref.id;
	},

	async updateBudgetEntry(userId, bucket, id, updates) {
		await updateDoc(doc(db, `users/${userId}/budgetData/${bucket}/data/${id}`), updates);
	},

	async deleteBudgetEntry(userId, bucket, id) {
		await deleteDoc(doc(db, `users/${userId}/budgetData/${bucket}/data/${id}`));
	},

	// ─── Notifications (was dashboard/Notifications.tsx) ───
	async fetchNotifications(userId) {
		const ref = collection(db, `users/${userId}/notifications`);
		const q = query(ref, orderBy("createdAt", "desc"));
		const snap = await getDocs(q);
		return snap.docs.map((docSnap): NotificationEntry => {
			const data = docSnap.data();
			return {
				id: docSnap.id,
				date: formatEntryDate(data.createdAt),
				notification: data.notification || "",
				category: data.category,
				amount: Number(data.amount) || 0,
				read: data.read === true,
				createdAt: toDate(data.createdAt),
			};
		});
	},

	// ─── Read state (new) ───
	// The only new write in the redesign: a `read` flag on a notification
	// document. Creating notifications is unchanged.
	async setNotificationRead(userId, id, read) {
		await updateDoc(doc(db, `users/${userId}/notifications/${id}`), { read });
	},

	async markNotificationsRead(userId, ids) {
		// Firestore batches cap at 500 writes
		for (let i = 0; i < ids.length; i += 500) {
			const batch = writeBatch(db);
			ids.slice(i, i + 500).forEach((id) => batch.update(doc(db, `users/${userId}/notifications/${id}`), { read: true }));
			await batch.commit();
		}
	},
};

