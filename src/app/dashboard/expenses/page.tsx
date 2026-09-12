"use client";
import { useState, useEffect } from "react";
import Pagination from "@/utils/Pagination";
import { db } from "@/firebase/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import {
	addDoc,
	getDocs,
	collection,
	serverTimestamp,
	query,
	orderBy,
	deleteDoc,
	doc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { formatFetchError } from "@/utils/formatFetchError";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";


type expenseDataType = {
	category: string;
	subCategory: string;
	amount: number;
	narration: string;
	date: string;
	id: string;
}[];

const ExpensesPage = () => {
	const { user, initialized: authInitialized } = useAuthStore();
	const currency = usePreferencesStore((s) => s.currency);

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	// starts true so the skeleton shows until the auth session resolves and the first fetch completes
	const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
	const [isDeletionLoading, setIsDeletionLoading] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [selectedIdForDeletion, setSelectedIdForDeletion] =
		useState<string>("");

	const [expenseData, setExpenseData] = useState<expenseDataType>([]);

	const [selectedCategory, setSelectedCategory] = useState("");
	const [subCategories, setSubCategories] = useState<string[]>([]);
	const [isSubCategoryLoading, setIsSubCategoryLoading] = useState<boolean>(false);

	const [categoryInput, setCategoriesInput] = useState<string>("");
	const [subCategoryInput, setSubCategoryInput] = useState<string>("");
	const [narrationInput, setNarrationInput] = useState<string>("");
	const [amountInput, setAmountInput] = useState<string>("");

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 9;

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = expenseData.slice(indexOfFirstItem, indexOfLastItem);

	const totalPages = Math.ceil(expenseData.length / itemsPerPage);
	const paginationRange = getPaginationRange(currentPage, totalPages);

	const fetchExpenses = async (userId: string) => {
		setIsDataLoading(true);

		try {
			const expenseReference = collection(db, `users/${userId}/expenseData`);
			const q = query(expenseReference, orderBy("createdAt", "desc"));

			const querySnapshot = await getDocs(q);

			const expenseList = querySnapshot.docs.map((docSnap) => {
				const data = docSnap.data();

				return {
					category: data.category,
					subCategory: data.subCategory,
					date:
						data.createdAt?.toDate().toLocaleString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						}) || "",
					narration: data.narration || "",
					amount: Number(data.amount) || 0,
					id: docSnap.id,
				};
			});

			return expenseList;
		} catch (err) {
			const message = formatFetchError(err);
			toast.error(`${message}`);
		} finally {
			setIsDataLoading(false);
		}
	};

	const addExpense = async () => {
		if (!user) return;

		if (
			!categoryInput.trim() ||
			!subCategoryInput.trim() ||
			!narrationInput.trim() ||
			isNaN(Number(amountInput)) ||
			Number(amountInput) <= 0
		) {
			toast.error(
				"All fields are required and amount must be a valid number"
			);
			return;
		}

		setIsLoading(true);

		try {
			await addDoc(collection(db, `users/${user.uid}/expenseData`), {
				category: categoryInput,
				subCategory: subCategoryInput,
				narration: narrationInput,
				amount: Number(amountInput),
				createdAt: serverTimestamp(),
			});

			await addDoc(collection(db, `users/${user.uid}/notifications`), {
				notification: `${formatMoney(Number(amountInput), currency)} was added to Expenses under ${categoryInput} — ${subCategoryInput}`,
				category: categoryInput,
				amount: Number(amountInput),
				createdAt: serverTimestamp(),
			});

			toast.success(
				`${formatMoney(Number(amountInput), currency)} added to Expenses`
			);

			setIsModalOpen(false);
			setCurrentPage(1);

			const updatedData = await fetchExpenses(user.uid);
			setExpenseData(updatedData ?? []);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);

			setCategoriesInput("");
			setSubCategoryInput("");
			setNarrationInput("");
			setAmountInput("");
		}
	};

	const deleteExpense = async (expenseId: string) => {
		if (!user) return;

		setIsDeletionLoading(true);

		try {
			await deleteDoc(doc(db, `users/${user.uid}/expenseData/${expenseId}`));

			setCurrentPage(1);
			const updatedData = await fetchExpenses(user.uid);
			setExpenseData(updatedData ?? []);

			toast.success("Expense entry deleted successfully");
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setSelectedIdForDeletion("");
			setIsDeleteModalOpen(false);
			setIsDeletionLoading(false);
		}
	};

	useEffect(() => {
		const fetchSubCategories = async () => {
			if (!user?.uid || !selectedCategory) return;

			const categoryKey =
				selectedCategory === "planned payments"
					? "plannedPayments"
					: selectedCategory === "daily needs"
						? "dailyNeeds"
						: selectedCategory === "others"
							? "others"
							: "";

			if (!categoryKey) return;

			setIsSubCategoryLoading(true);
			setSubCategories([]);

			try {
				const querySnapshot = await getDocs(
					collection(db, `users/${user.uid}/budgetData/${categoryKey}/data`)
				);

				const fetchedCategories = new Set<string>();

				querySnapshot.forEach((docSnap) => {
					const data = docSnap.data();
					if (data.category) {
						fetchedCategories.add(data.category);
					}
				});

				setSubCategories(Array.from(fetchedCategories));
			} finally {
				setIsSubCategoryLoading(false);
			}
		};

		fetchSubCategories();
	}, [selectedCategory, user?.uid]);

	useEffect(() => {
		const getData = async () => {
			if (!authInitialized) return;
			if (!user) {
				setIsDataLoading(false);
				return;
			}
			setExpenseData((await fetchExpenses(user.uid)) ?? []);
		};
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on session change only
	}, [user?.uid, authInitialized]);

	return (
		<div className="relative dashboardScreen">
			<div>
				<h1 className="dashboardHeading">Expenses</h1>

				<div>
					{/* Mobile list */}
					<div className="mt-5 md:hidden">
						<div className="mb-4 flex flex-row items-center justify-between">
							<p className="text-sm font-semibold uppercase tracking-wide text-brand-500 dark:text-green-400">
								Entries
							</p>
							<button
								type="button"
								className="btn-primary"
								onClick={() => setIsModalOpen(true)}
							>
								+ Add
							</button>
						</div>

						{isDataLoading ? (
							<div className="space-y-3">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-dark-muted"
									/>
								))}
							</div>
						) : currentItems.length === 0 ? (
							<EmptyState
								title="No expenses yet"
								description="Log spending to see it listed here."
							/>
						) : (
							<div className="space-y-3">
								{currentItems.map((element) => (
									<div
										key={element.id}
										className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-raised"
									>
										<div className="flex flex-row items-start justify-between gap-2">
											<div>
												<p className="capitalize text-zinc-900 dark:text-zinc-100">
													{element.category}
												</p>
												<p className="text-xs font-bold capitalize text-brand-500 dark:text-green-400">
													{element.subCategory}
												</p>
												<p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
													{element.narration}
												</p>
												<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
													{element.date}
												</p>
											</div>
											<div className="text-right">
												<p className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
													{formatMoney(element.amount, currency)}
												</p>
												<button
													type="button"
													className="-mr-3 mt-1 inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
													onClick={() => {
														setSelectedIdForDeletion(element.id);
														setIsDeleteModalOpen(true);
													}}
												>
													Delete
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Desktop */}
					<div className="mt-5 hidden text-sm md:block">
						<div className="overflow-x-auto rounded-t-2xl">
							<div className="dataTableHeader grid min-w-[820px] w-full grid-cols-5">
								<p className="tableStickyHeaderCell min-w-[140px] pl-2">Category</p>
								<p>Narration</p>
								<p>Time</p>
								<p>Amount</p>
								<p className="text-center">Action</p>
							</div>
						</div>

						{isDataLoading ? (
							<div className="dataTableSurface min-h-[40dvh] space-y-3 p-4">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div
										key={i}
										className="h-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-dark-muted"
									/>
								))}
							</div>
						) : (
							<div className="dataTableSurface min-h-[65dvh] overflow-x-auto p-3">
								<div className="flex flex-row items-center justify-between border-b border-zinc-200 pb-3 dark:border-dark-border">
									<p className="font-semibold text-brand-500 dark:text-green-400">
										Transactions
									</p>

									<button
										type="button"
										className="btn-primary"
										onClick={() => setIsModalOpen(true)}
									>
										+ Add
									</button>
								</div>

								{currentItems.length === 0 ? (
									<EmptyState
										title="No expenses yet"
										description="Log spending to see it listed here."
									/>
								) : (
									<div className="min-w-[820px]">
										{currentItems.map((element) => (
											<div
												className="grid grid-cols-5 border-b border-zinc-100 py-3 last:border-0 dark:border-dark-border"
												key={element.id}
											>
												<div className="tableStickyCell min-w-[140px] pl-2 pt-1 capitalize">
													<p className="text-zinc-900 dark:text-zinc-100">
														{element.category}
													</p>
													<p className="text-xs font-bold text-brand-500 dark:text-green-400">
														{element.subCategory}
													</p>
												</div>

												<p className="pt-1 text-zinc-800 dark:text-zinc-200">
													{element.narration}
												</p>
												<p className="pt-1 text-zinc-600 dark:text-zinc-400">
													{element.date}
												</p>
												<p className="pt-1 tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
													{formatMoney(element.amount, currency)}
												</p>
												<div className="flex flex-row items-center justify-center pt-1">
													<button
														type="button"
														className="iconBtn text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
														onClick={() => {
															setSelectedIdForDeletion(element.id);
															setIsDeleteModalOpen(true);
														}}
														aria-label="Delete expense"
													>
														<Trash2 className="h-5 w-5" aria-hidden />
													</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>

					{totalPages > 1 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={expenseData.length}
							itemsPerPage={itemsPerPage}
							paginationRange={paginationRange}
							onPageChange={setCurrentPage}
						/>
					)}
				</div>
			</div>

			<AccessibleDialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Add expenditure"
				titleId="expense-add-dialog-title"
			>
				<form
					className="flex flex-col gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						addExpense();
					}}
				>
					<div className="inputLabelGroup">
						<label htmlFor="expense-category" className="inputLabel">
							Category
						</label>
						<select
							name="category"
							id="expense-category"
							className="formInput"
							value={categoryInput}
							onChange={(e) => {
								setCategoriesInput(e.target.value);
								setSelectedCategory(e.target.value);
							}}
						>
							<option value="" disabled>
								Enter category
							</option>
							<option value="planned payments">Planned Payments</option>
							<option value="daily needs">Daily Needs</option>
							<option value="others">Others</option>
						</select>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="subcategory" className="inputLabel">
							Sub category
						</label>

						<select
							name="subcategory"
							id="subcategory"
							className="formInput capitalize"
							value={subCategoryInput}
							onChange={(e) => {
								setSubCategoryInput(e.target.value);
							}}
							disabled={isSubCategoryLoading}
						>
							<option value="" disabled>
								{isSubCategoryLoading ? "Loading subcategories..." : "Select a sub category"}
							</option>

							{subCategories.map((element, index) => (
								<option value={element} key={index} className="capitalize">
									{element}
								</option>
							))}
						</select>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="narration" className="inputLabel">
							Narration
						</label>
						<input
							className="formInput"
							type="text"
							name="narration"
							id="narration"
							placeholder="Enter narration"
							value={narrationInput}
							onChange={(e) => setNarrationInput(e.target.value)}
						/>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="amount" className="inputLabel">
							Amount
						</label>
						<input
							className="formInput"
							type="number"
							inputMode="decimal"
							min="0"
							step="0.01"
							name="amount"
							id="amount"
							placeholder="Enter amount"
							value={amountInput}
							onChange={(e) => setAmountInput(e.target.value)}
						/>
					</div>

					<button
						type="submit"
						className="btn-primary mt-4 w-full"
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							"Add"
						)}
					</button>
				</form>
			</AccessibleDialog>

			<AccessibleDialog
				open={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Delete expense?"
				titleId="expense-delete-dialog-title"
			>
				<p className="mb-5 text-zinc-600 dark:text-zinc-400">
					This removes the expense permanently.
				</p>

				<div className="flex flex-row items-center justify-center gap-5">
					<button
						type="button"
						className="btn-danger w-28"
						onClick={() => {
							deleteExpense(selectedIdForDeletion);
						}}
					>
						{isDeletionLoading ? (
							<div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							"Delete"
						)}
					</button>
					<button
						type="button"
						className="btn-secondary w-28"
						onClick={() => setIsDeleteModalOpen(false)}
					>
						Cancel
					</button>
				</div>
			</AccessibleDialog>
		</div>
	);
};

export default ExpensesPage;
