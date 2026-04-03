"use client";
import { useState, useEffect } from "react";
import Pagination from "@/utils/Pagination";
import Image from "next/image";
import { auth, db } from "@/firebase/firebase";
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
import { formatFetchError } from "@/utils/formatFetchError";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";

import deleteIcon from "../../../assets/dashboard/delete icon.svg";

type expenseDataType = {
	category: string;
	subCategory: string;
	amount: number;
	narration: string;
	date: string;
	id: string;
}[];

const ExpensesPage = () => {
	const user = auth.currentUser;
	const currency = usePreferencesStore((s) => s.currency);

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
	const [isDeletionLoading, setIsDeletionLoading] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [selectedIdForDeletion, setSelectedIdForDeletion] =
		useState<string>("");

	const [expenseData, setExpenseData] = useState<expenseDataType>([]);

	const [selectedCategory, setSelectedCategory] = useState("");
	const [subCategories, setSubCategories] = useState<string[]>([]);

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
				notification: ` was added to the Expenses under the category of `,
				category: categoryInput,
				amount: Number(amountInput),
				createdAt: serverTimestamp(),
			});

			toast.success(
				`${formatMoney(Number(amountInput), currency)} added to Expenses`
			);

			setIsModalOpen(false);

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
		};

		fetchSubCategories();
	}, [selectedCategory, user?.uid]);

	useEffect(() => {
		const getData = async () => {
			if (user) {
				setExpenseData((await fetchExpenses(user.uid)) ?? []);
			}
		};
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mount / uid only
	}, [user?.uid]);

	return (
		<div className="relative dashboardScreen">
			<div>
				<h1 className="dashboardHeading">expenses</h1>

				<div>
					{/* Mobile list */}
					<div className="mt-5 md:hidden">
						<div className="mb-4 flex flex-row items-center justify-between">
							<p className="text-sm font-semibold uppercase tracking-wide text-[#2D6A4F] dark:text-[#95D5B2]">
								Entries
							</p>
							<button
								type="button"
								className="rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
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
										className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
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
										className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
									>
										<div className="flex flex-row items-start justify-between gap-2">
											<div>
												<p className="capitalize text-slate-900 dark:text-slate-100">
													{element.category}
												</p>
												<p className="text-xs font-bold capitalize text-[#2D6A4F] dark:text-[#95D5B2]">
													{element.subCategory}
												</p>
												<p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
													{element.narration}
												</p>
												<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
													{element.date}
												</p>
											</div>
											<div className="text-right">
												<p className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
													{formatMoney(element.amount, currency)}
												</p>
												<button
													type="button"
													className="mt-2 text-sm text-red-600 dark:text-red-400"
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
						<div className="overflow-x-auto rounded-t-xl">
							<div className="dataTableHeader grid min-w-[820px] w-full grid-cols-5">
								<p className="tableStickyCell min-w-[140px] pl-2">category</p>
								<p>narration</p>
								<p>time</p>
								<p>amount</p>
								<p className="text-center">action</p>
							</div>
						</div>

						{isDataLoading ? (
							<div className="dataTableSurface min-h-[40dvh] space-y-3 p-4">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div
										key={i}
										className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700"
									/>
								))}
							</div>
						) : (
							<div className="dataTableSurface min-h-[65dvh] overflow-x-auto p-3">
								<div className="flex flex-row items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
									<p className="font-semibold text-[#2D6A4F] dark:text-[#95D5B2]">
										Transactions
									</p>

									<button
										type="button"
										className="rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
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
												className="grid grid-cols-5 border-b border-slate-100 py-3 last:border-0 dark:border-slate-700"
												key={element.id}
											>
												<div className="tableStickyCell min-w-[140px] pl-2 pt-1 capitalize">
													<p className="text-slate-900 dark:text-slate-100">
														{element.category}
													</p>
													<p className="text-xs font-bold text-[#2D6A4F] dark:text-[#95D5B2]">
														{element.subCategory}
													</p>
												</div>

												<p className="pt-1 text-slate-800 dark:text-slate-200">
													{element.narration}
												</p>
												<p className="pt-1 text-slate-600 dark:text-slate-400">
													{element.date}
												</p>
												<p className="pt-1 tabular-nums font-medium text-slate-900 dark:text-slate-100">
													{formatMoney(element.amount, currency)}
												</p>
												<div className="flex flex-row items-center justify-center pt-1">
													<button
														type="button"
														className="rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
														onClick={() => {
															setSelectedIdForDeletion(element.id);
															setIsDeleteModalOpen(true);
														}}
														aria-label="Delete expense"
													>
														<Image
															src={deleteIcon}
															alt=""
															className="h-6 w-6 cursor-pointer transition ease-in-out hover:scale-110"
														/>
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
							className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
							className="rounded-lg border border-slate-200 bg-white px-4 py-2 capitalize text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
							value={subCategoryInput}
							onChange={(e) => {
								setSubCategoryInput(e.target.value);
							}}
						>
							<option value="" disabled>
								Select a sub category
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
							className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
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
							className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
							type="number"
							name="amount"
							id="amount"
							placeholder="Enter amount"
							value={amountInput}
							onChange={(e) => setAmountInput(e.target.value)}
						/>
					</div>

					<button
						type="submit"
						className="mt-4 w-full rounded-lg bg-[#2D6A4F] py-2 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
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
				<p className="mb-5 text-slate-600 dark:text-slate-400">
					This removes the expense permanently.
				</p>

				<div className="flex flex-row items-center justify-center gap-5">
					<button
						type="button"
						className="w-28 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
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
						className="w-28 rounded-lg bg-slate-500 px-4 py-2 text-white transition hover:bg-slate-600"
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
