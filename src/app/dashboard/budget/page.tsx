"use client";
import { useState, useEffect, useMemo } from "react";
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
	updateDoc,
	doc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { formatFetchError } from "@/utils/formatFetchError";

import editIcon from "../../../assets/dashboard/edit icon.svg";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";

type budgetDataType = {
	id: string;
	category: string;
	description: string | null;
	amount: number | null;
	setLimit: number;
	date: string;
}[];

type EditingEntry = {
	id: string;
	budgetSection: "dailyNeeds" | "plannedPayments" | "others";
	category: string;
	description: string;
	amount: string;
	setLimit: string;
};

type Expense = {
	category: string;
	subCategory: string;
	amount: number;
	date: string;
	narration: string;
};

type CategoryTotals = {
	[category: string]: {
		[subCategory: string]: {
			totalSpent: number;
			expenses: Expense[];
		};
	};
};

const BudgetScreen = () => {
	const user = auth.currentUser;
	const currency = usePreferencesStore((s) => s.currency);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [dataLoading, setDataLoading] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedModal, setSelectedModal] = useState<
		"daily needs" | "planned payments" | "others"
	>("daily needs");

	// daily needs
	const [dailyNeedsCategoryInput, setDailyNeedsCategoryInput] =
		useState<string>("");
	const [dailyNeedsDescriptionInput, setDailyNeedsDescriptionInput] =
		useState<string>("");
	const [dailyNeedsLimitInput, setDailyNeedsLimitInput] = useState<string>("");

	// planned payments
	const [plannedPaymentsCategoryInput, setPlannedPaymentsCategoryInput] =
		useState<string>("");
	const [plannedPaymentsAmountInput, setPlannedPaymentsAmountInput] =
		useState<string>("");

	// others
	const [othersCategoryInput, setOthersCategoryInput] = useState<string>("");
	const [othersDescriptionInput, setOthersDescriptionInput] =
		useState<string>("");
	const [othersLimitInput, setOthersLimitInput] = useState<string>("");

	// budget category data
	const [plannedPaymentsData, setPlannedPaymentsData] =
		useState<budgetDataType>([]);
	const [dailyNeedsData, setDailyNeedsData] = useState<budgetDataType>([]);
	const [othersData, setOthersData] = useState<budgetDataType>([]);

	// expenses
	const [expenses, setExpenses] = useState<{
		totalsByCategory: CategoryTotals;
	} | null>();

	// edit & delete
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
	const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);
	const [deletingEntry, setDeletingEntry] = useState<{
		id: string;
		budgetSection: "dailyNeeds" | "plannedPayments" | "others";
	} | null>(null);
	const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
	const [isDeleteEntryLoading, setIsDeleteEntryLoading] = useState<boolean>(false);

	// helper for bar color
	const getBarColor = (percent: number) => {
		if (percent < 25) return "bg-green-500";
		if (percent < 50) return "bg-blue-500";
		if (percent < 75) return "bg-yellow-400";
		return "bg-red-500";
	};

	const addCategory = async (
		selectedCategory: "daily needs" | "planned payments" | "others"
	) => {
		if (!user) return;

		const category =
			selectedCategory === "daily needs"
				? "dailyNeeds"
				: selectedCategory === "planned payments"
				? "plannedPayments"
				: selectedCategory === "others"
				? "others"
				: "";

		// validation for daily needs
		if (selectedModal === "daily needs") {
			if (
				!dailyNeedsCategoryInput.trim() ||
				!dailyNeedsDescriptionInput.trim() ||
				isNaN(Number(dailyNeedsLimitInput)) ||
				Number(dailyNeedsLimitInput) <= 0
			) {
				toast.error(
					"All fields are required and amount must be a valid number"
				);
				return;
			}
		}

		// validation for others
		if (selectedModal === "others") {
			if (
				!othersCategoryInput.trim() ||
				!othersDescriptionInput.trim() ||
				isNaN(Number(othersLimitInput)) ||
				Number(othersLimitInput) <= 0
			) {
				toast.error(
					"All fields are required and amount must be a valid number"
				);
				return;
			}
		}

		// planned payments validation
		if (selectedModal === "planned payments") {
			if (
				!plannedPaymentsCategoryInput.trim() ||
				!plannedPaymentsAmountInput.trim()
			) {
				toast.error(
					"All fields are required and amount must be a valid number"
				);
				return;
			}
		}

		// duplicate category validation
		const newCategoryName =
			selectedModal === "daily needs"
				? dailyNeedsCategoryInput.trim().toLowerCase()
				: selectedModal === "planned payments"
				? plannedPaymentsCategoryInput.trim().toLowerCase()
				: othersCategoryInput.trim().toLowerCase();

		const dataArray =
			selectedModal === "daily needs"
				? dailyNeedsData
				: selectedModal === "planned payments"
				? plannedPaymentsData
				: othersData;

		if (dataArray.some((e) => e.category.toLowerCase() === newCategoryName)) {
			toast.error(`A "${newCategoryName}" category already exists in ${selectedModal}`);
			return;
		}

		setIsLoading(true);

		try {
			await addDoc(
				collection(db, `users/${user.uid}/budgetData/${category}/data`),
				{
					createdAt: serverTimestamp(),
					category:
						selectedCategory === "daily needs"
							? dailyNeedsCategoryInput
							: selectedCategory === "planned payments"
							? plannedPaymentsCategoryInput
							: selectedCategory === "others"
							? othersCategoryInput
							: null,

					description:
						selectedCategory === "daily needs"
							? dailyNeedsDescriptionInput
							: selectedCategory === "others"
							? othersDescriptionInput
							: null,
					amount:
						selectedCategory === "planned payments"
							? Number(plannedPaymentsAmountInput)
							: null,

					setLimit:
						selectedCategory === "daily needs"
							? Number(dailyNeedsLimitInput)
							: selectedCategory === "others"
							? Number(othersLimitInput)
							: null,
				}
			);

			toast.success(`${selectedModal} entry added successfully`);

			fetchBudgetData(user.uid);
			setIsModalOpen(false);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);

			setDailyNeedsCategoryInput("");
			setDailyNeedsDescriptionInput("");
			setDailyNeedsLimitInput("");
			setPlannedPaymentsCategoryInput("");
			setPlannedPaymentsAmountInput("");
			setOthersCategoryInput("");
			setOthersDescriptionInput("");
			setOthersLimitInput("");
		}
	};

	const fetchBudgetData = async (userId: string) => {
		if (!user) return;

		setDataLoading(true);

		try {
			const fetchCategory = async (category: string) => {
				const ref = collection(
					db,
					`users/${userId}/budgetData/${category}/data`
				);
				const q = query(ref, orderBy("createdAt", "desc"));
				const snapshot = await getDocs(q);

				return snapshot.docs.map((docSnap) => {
					const data = docSnap.data();

					return {
						id: docSnap.id,
						date:
							data.createdAt?.toDate().toLocaleString("en-GB", {
								day: "2-digit",
								month: "short",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								hour12: true,
							}) || "",
						category: data.category,
						description: data.description || "",
						amount: Number(data.amount) || 0,
						setLimit: Number(data.setLimit) || 0,
					};
				});
			};

			// Fetch all three categories in parallel
			const [dailyNeeds, plannedPayments, others] = await Promise.all([
				fetchCategory("dailyNeeds"),
				fetchCategory("plannedPayments"),
				fetchCategory("others"),
			]);

			setDailyNeedsData(dailyNeeds);
			setPlannedPaymentsData(plannedPayments);
			setOthersData(others);

			// toast.success("Budget categories fetched successfully");
		} catch (err) {
			const message = formatFetchError(err);
			toast.error(`${message}`);
		} finally {
			setDataLoading(false);
		}
	};

	const fetchExpensesWithTotals = async (userId: string) => {
		try {
			const expenseRef = collection(db, `users/${userId}/expenseData`);
			const q = query(expenseRef, orderBy("createdAt", "desc"));

			const snapshot = await getDocs(q);

			const expenseList: Expense[] = snapshot.docs.map((doc) => {
				const data = doc.data();

				return {
					category: data.category.toLowerCase(),
					subCategory: data.subCategory.toLowerCase(),
					amount: Number(data.amount) || 0,
					narration: data.narration || "",
					date:
						data.createdAt?.toDate().toLocaleString("en-GB", {
							day: "2-digit",
							month: "short",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							hour12: true,
						}) || "",
				};
			});

			// ✅ Dynamically aggregate totals
			const totals: CategoryTotals = {};

			expenseList.forEach((expense) => {
				const { category, subCategory, amount } = expense;

				if (!totals[category]) {
					totals[category] = {};
				}

				if (!totals[category][subCategory]) {
					totals[category][subCategory] = {
						totalSpent: 0,
						expenses: [],
					};
				}

				totals[category][subCategory].totalSpent += amount;
				totals[category][subCategory].expenses.push(expense);
			});

			// toast.success("Expenses and sub-category totals fetched");

			return {
				totalsByCategory: totals,
			};
		} catch (err) {
			const message = formatFetchError(err);
			toast.error(`${message}`);
		}
	};

	const getTotalForSubCategory = (
		category: string,
		subCategory: string
	): number => {
		return expenses?.totalsByCategory[category]?.[subCategory]?.totalSpent ?? 0;
	};

	const deleteEntry = async () => {
		if (!user || !deletingEntry) return;

		setIsDeleteEntryLoading(true);

		try {
			await deleteDoc(
				doc(db, `users/${user.uid}/budgetData/${deletingEntry.budgetSection}/data/${deletingEntry.id}`)
			);
			toast.success("Entry deleted");
			fetchBudgetData(user.uid);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsDeleteEntryLoading(false);
			setIsDeleteConfirmOpen(false);
			setDeletingEntry(null);
		}
	};

	const updateEntry = async () => {
		if (!user || !editingEntry) return;

		setIsEditLoading(true);

		try {
			const ref = doc(
				db,
				`users/${user.uid}/budgetData/${editingEntry.budgetSection}/data/${editingEntry.id}`
			);

			const updates: Record<string, string | number> = {
				category: editingEntry.category.trim(),
			};

			if (editingEntry.budgetSection === "plannedPayments") {
				if (isNaN(Number(editingEntry.amount)) || Number(editingEntry.amount) <= 0) {
					toast.error("Amount must be a valid positive number");
					return;
				}
				updates.amount = Number(editingEntry.amount);
			} else {
				if (!editingEntry.description.trim()) {
					toast.error("Description is required");
					return;
				}
				if (isNaN(Number(editingEntry.setLimit)) || Number(editingEntry.setLimit) <= 0) {
					toast.error("Limit must be a valid positive number");
					return;
				}
				updates.description = editingEntry.description.trim();
				updates.setLimit = Number(editingEntry.setLimit);
			}

			await updateDoc(ref, updates);
			toast.success("Entry updated");
			fetchBudgetData(user.uid);
			setIsEditModalOpen(false);
			setEditingEntry(null);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsEditLoading(false);
		}
	};

	// fetch budget data
	useEffect(() => {
		if (!user) return;

		fetchBudgetData(user.uid);

		(async () => {
			const result = await fetchExpensesWithTotals(user.uid);
			if (result) {
				setExpenses(result); // store both expenses + totals
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mount / uid only
	}, [user?.uid]);

	const modalTitle = useMemo(() => {
		if (selectedModal === "daily needs") return "Add daily needs";
		if (selectedModal === "planned payments") return "Add planned payments";
		return "Add others";
	}, [selectedModal]);

	return (
		<div className="relative dashboardScreen">
			<div>
				<h1 className="dashboardHeading">budget</h1>

				{dataLoading ? (
					<div className="flex min-h-[70dvh] flex-col gap-6 py-8">
						{[0, 1, 2].map((k) => (
							<div
								key={k}
								className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-dark-overlay"
							/>
						))}
					</div>
				) : (
					<div>
						{/* daily needs */}
						<div className=" budgetCategories">
							<div className="budgetCategoriesHeading">
								<h1 className=" budgetCategoriesHeadingText">daily needs</h1>

								<button
									className=" dailyNeedsAddButton"
									onClick={() => {
										setIsModalOpen(!isModalOpen);
										setSelectedModal("daily needs");
									}}
								>
									+ New Category
								</button>
							</div>

							<div className="w-full overflow-x-auto">
							<table className="min-w-[900px] w-full mt-4 border-separate border-spacing-x-4">
								<colgroup>
									<col className=" w-72" />
									<col className="w-32" />
									<col className="w-32" />
									<col className="w-60" />
								</colgroup>

								<thead className="capitalize">
									<tr>
										<th className="tableStickyCell text-start">category</th>
										<th className="text-start">set limit</th>
										<th className="text-start">amount spent</th>
										<th className="text-start">status</th>
									</tr>
								</thead>

								<tbody>
									{dailyNeedsData.length === 0 ? (
										<tr>
											<td colSpan={4} className="py-10">
												<EmptyState
													title="No daily needs categories"
													description="Create a category to set spending limits."
												/>
											</td>
										</tr>
									) : (
										dailyNeedsData.map((element, index) => {
										const totalSpent = getTotalForSubCategory(
											"daily needs",
											element.category
										);

										const percentage = element.setLimit
											? (totalSpent / element.setLimit) * 100
											: 0;

										return (
											<tr className="border-b border-zinc-200 dark:border-dark-border" key={index}>
												<td className="tableStickyCell py-4">
													<div className="flex flex-col gap-2">
														<p className="capitalize">{element.category}</p>
														<p className="text-xs">
															<span className="text-brand-400 dark:text-green-400">
																Description:{" "}
															</span>
															<span className="italic">
																{element.description}
															</span>
														</p>
													</div>
												</td>

												<td className="py-4 tabular-nums">
													{formatMoney(element.setLimit, currency)}
												</td>
												<td className="py-4 tabular-nums">
													{formatMoney(totalSpent, currency)}
												</td>

												<td className="progressBarContainer">
													<div className="progressBarBody">
														<div
															className={`h-5 flex items-center justify-center text-xs rounded-full font-medium text-white ${getBarColor(
																percentage
															)}`}
															style={{
																width: `${Math.min(percentage, 100)}%`,
															}}
														>
															{percentage.toFixed(1)}%
														</div>
													</div>

													<div className="flex gap-2">
														<button
															type="button"
															className="budgetEditIcon opacity-70 hover:opacity-100"
															aria-label="Edit entry"
															onClick={() => {
																setEditingEntry({
																	id: element.id,
																	budgetSection: "dailyNeeds",
																	category: element.category,
																	description: element.description ?? "",
																	amount: "",
																	setLimit: String(element.setLimit),
																});
																setIsEditModalOpen(true);
															}}
														>
															<Image src={editIcon} alt="" />
														</button>
														<button
															type="button"
															className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
															aria-label="Delete entry"
															onClick={() => {
																setDeletingEntry({ id: element.id, budgetSection: "dailyNeeds" });
																setIsDeleteConfirmOpen(true);
															}}
														>
															✕
														</button>
													</div>
												</td>
											</tr>
										);
									})
									)}
								</tbody>
							</table>
							</div>
						</div>

						{/* planned payments */}
						<div className="budgetCategories">
							<div className="budgetCategoriesHeading">
								<h1 className="budgetCategoriesHeadingText ">
									planned payments
								</h1>

								<button
									className=" dailyNeedsAddButton"
									onClick={() => {
										setIsModalOpen(!isModalOpen);
										setSelectedModal("planned payments");
									}}
								>
									+ New Category
								</button>
							</div>

							<div className="w-full overflow-x-auto">
							<table className="min-w-[900px] w-full mt-4">
								<thead className="capitalize">
									<tr>
										<th className="tableStickyCell text-start">category</th>
										<th className="text-start">set limit</th>
										<th className="text-start">amount spent</th>
										<th className="text-start">status</th>
									</tr>
								</thead>

								<tbody>
									{plannedPaymentsData.length === 0 ? (
										<tr>
											<td colSpan={4} className="py-10">
												<EmptyState
													title="No planned payments"
													description="Add a category and limit to track bills and subscriptions."
												/>
											</td>
										</tr>
									) : (
										plannedPaymentsData.map((element, index) => {
										const totalSpent = getTotalForSubCategory(
											"planned payments",
											element.category
										);

										// avoid null amount
										const percentage = element.amount
											? (totalSpent / element.amount) * 100
											: 0;

										return (
											<tr className="border-b border-zinc-200 dark:border-dark-border" key={index}>
												<td className="tableStickyCell py-4 capitalize">{element.category}</td>
												<td className="py-4 tabular-nums">
													{element.amount != null
														? formatMoney(element.amount, currency)
														: "—"}
												</td>
												<td className="py-4 tabular-nums">
													{formatMoney(totalSpent, currency)}
												</td>

												<td className="progressBarContainer">
													<div className="progressBarBody">
														<div
															className={`progressBarTracker ${getBarColor(
																percentage
															)}`}
															style={{
																width: `${Math.min(percentage, 100)}%`,
															}}
														>
															{percentage.toFixed(1)}%
														</div>
													</div>

													<div className="flex gap-2">
														<button
															type="button"
															className="budgetEditIcon opacity-70 hover:opacity-100"
															aria-label="Edit entry"
															onClick={() => {
																setEditingEntry({
																	id: element.id,
																	budgetSection: "plannedPayments",
																	category: element.category,
																	description: "",
																	amount: element.amount != null ? String(element.amount) : "",
																	setLimit: "",
																});
																setIsEditModalOpen(true);
															}}
														>
															<Image src={editIcon} alt="" />
														</button>
														<button
															type="button"
															className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
															aria-label="Delete entry"
															onClick={() => {
																setDeletingEntry({ id: element.id, budgetSection: "plannedPayments" });
																setIsDeleteConfirmOpen(true);
															}}
														>
															✕
														</button>
													</div>
												</td>
											</tr>
										);
									})
									)}
								</tbody>
							</table>
							</div>
						</div>

						{/* others */}
						<div className="budgetCategories">
							<div className="pb-3 border-b border-zinc-200">
								<div className="budgetCategoriesHeading">
									<h1 className="budgetCategoriesHeadingText ">others</h1>

									<button
										className=" dailyNeedsAddButton"
										onClick={() => {
											setIsModalOpen(!isModalOpen);
											setSelectedModal("others");
										}}
									>
										+ New Category
									</button>
								</div>

								<p className="text-sm ">
									Includes expenditures that do not fit into pre existing
									categories.
								</p>
							</div>

							<div className="w-full overflow-x-auto">
							<table className="min-w-[900px] w-full mt-4">
								<colgroup>
									<col className="w-72" />
									<col className="w-32" />
									<col className="w-32" />
									<col className="w-64" />
								</colgroup>

								<thead className="capitalize">
									<tr>
										<th className="tableStickyCell text-start">category</th>
										<th className="text-start">set limit</th>
										<th className="text-start">amount spent</th>
										<th className="text-start">status</th>
									</tr>
								</thead>

								<tbody>
									{othersData.length === 0 ? (
										<tr>
											<td colSpan={4} className="py-10">
												<EmptyState
													title="No “others” categories"
													description="Use this section for spending outside your main buckets."
												/>
											</td>
										</tr>
									) : (
										othersData.map((element, index) => {
										const totalSpent = getTotalForSubCategory(
											"others",
											element.category
										);

										const percentage = element.setLimit
											? (totalSpent / element.setLimit) * 100
											: 0;

										return (
											<tr className="border-b border-zinc-200 dark:border-dark-border" key={index}>
												<td className="tableStickyCell py-4">
													<div className="flex flex-col gap-2">
														<p className="capitalize">{element.category}</p>
														<p className="text-xs">
															<span className="text-brand-400 dark:text-green-400">
																Description:{" "}
															</span>
															<span className="italic">
																{element.description}
															</span>
														</p>
													</div>
												</td>

												<td className="py-4 tabular-nums">
													{formatMoney(element.setLimit, currency)}
												</td>
												<td className="py-4 tabular-nums">
													{formatMoney(totalSpent, currency)}
												</td>

												<td className="progressBarContainer">
													<div className="progressBarBody">
														<div
															className={`progressBarTracker ${getBarColor(
																percentage
															)}`}
															style={{
																width: `${Math.min(percentage, 100)}%`,
															}}
														>
															{percentage.toFixed(1)}%
														</div>
													</div>

													<div className="flex gap-2">
														<button
															type="button"
															className="budgetEditIcon opacity-70 hover:opacity-100"
															aria-label="Edit entry"
															onClick={() => {
																setEditingEntry({
																	id: element.id,
																	budgetSection: "others",
																	category: element.category,
																	description: element.description ?? "",
																	amount: "",
																	setLimit: String(element.setLimit),
																});
																setIsEditModalOpen(true);
															}}
														>
															<Image src={editIcon} alt="" />
														</button>
														<button
															type="button"
															className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
															aria-label="Delete entry"
															onClick={() => {
																setDeletingEntry({ id: element.id, budgetSection: "others" });
																setIsDeleteConfirmOpen(true);
															}}
														>
															✕
														</button>
													</div>
												</td>
											</tr>
										);
									})
									)}
								</tbody>
							</table>
							</div>
						</div>
					</div>
				)}
			</div>

			<AccessibleDialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={modalTitle}
				titleId="budget-modal-title"
			>
					<form
						className="flex flex-col gap-2"
						onSubmit={(e) => {
							e.preventDefault();

							addCategory(selectedModal);
						}}
					>
						{selectedModal === "daily needs" || selectedModal === "others" ? (
							<div className="inputLabelGroup">
								<label htmlFor="category" className="inputLabel">
									Category
								</label>
								<input
									className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0"
									type="text"
									name="category"
									id="category"
									placeholder="Enter category name"
									value={
										selectedModal === "daily needs"
											? dailyNeedsCategoryInput
											: selectedModal === "others"
											? othersCategoryInput
											: ""
									}
									onChange={(e) => {
										if (selectedModal === "daily needs") {
											setDailyNeedsCategoryInput(e.target.value);
										}

										if (selectedModal === "others") {
											setOthersCategoryInput(e.target.value);
										}
									}}
								/>
							</div>
						) : (
							""
						)}

						{selectedModal === "daily needs" || selectedModal === "others" ? (
							<div className="inputLabelGroup">
								<label htmlFor="description" className="inputLabel">
									Description
								</label>
								<textarea
									className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0 max-h-32"
									name="description"
									id="description"
									placeholder="Enter description"
									value={
										selectedModal === "daily needs"
											? dailyNeedsDescriptionInput
											: selectedModal === "others"
											? othersDescriptionInput
											: ""
									}
									onChange={(e) => {
										if (selectedModal === "daily needs") {
											setDailyNeedsDescriptionInput(e.target.value);
										}

										if (selectedModal === "others") {
											setOthersDescriptionInput(e.target.value);
										}
									}}
								></textarea>
							</div>
						) : (
							""
						)}

						{selectedModal === "planned payments" ? (
							<div className="inputLabelGroup">
								<label htmlFor="amount" className="inputLabel">
									category
								</label>
								<input
									className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0"
									type="text"
									name="category"
									id="category"
									placeholder="Enter category name"
									value={plannedPaymentsCategoryInput}
									onChange={(e) =>
										setPlannedPaymentsCategoryInput(e.target.value)
									}
								/>
							</div>
						) : (
							""
						)}

						{selectedModal === "daily needs" || selectedModal === "others" ? (
							<div className="inputLabelGroup">
								<label htmlFor="set-limit" className="inputLabel">
									Set Limit
								</label>
								<input
									type="number"
									className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0"
									name="set-limit"
									id="set-limit"
									placeholder="Set Limit"
									value={
										selectedModal === "daily needs"
											? dailyNeedsLimitInput
											: selectedModal === "others"
											? othersLimitInput
											: ""
									}
									onChange={(e) => {
										if (selectedModal === "daily needs") {
											setDailyNeedsLimitInput(e.target.value);
										}

										if (selectedModal === "others") {
											setOthersLimitInput(e.target.value);
										}
									}}
								/>
							</div>
						) : (
							""
						)}

						{selectedModal === "planned payments" ? (
							<div className="inputLabelGroup">
								<label htmlFor="set-amount" className="inputLabel">
									Set limit
								</label>
								<input
									type="number"
									className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0"
									name="set-plannedPayment-limit"
									id="set-plannedPayment-limit"
									placeholder="Set Limit"
									value={plannedPaymentsAmountInput}
									onChange={(e) =>
										setPlannedPaymentsAmountInput(e.target.value)
									}
								/>
							</div>
						) : (
							""
						)}

						<button
							type="submit"
							className="mt-4 w-full rounded-lg bg-brand-500 py-2 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
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
		{/* Edit entry modal */}
		<AccessibleDialog
			open={isEditModalOpen}
			onClose={() => { setIsEditModalOpen(false); setEditingEntry(null); }}
			title="Edit entry"
			titleId="budget-edit-dialog-title"
		>
			{editingEntry && (
				<form
					className="flex flex-col gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						updateEntry();
					}}
				>
					<div className="inputLabelGroup">
						<label htmlFor="edit-category" className="inputLabel">Category</label>
						<input
							className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0 bg-white dark:bg-dark-base dark:border-dark-border dark:text-zinc-100"
							type="text"
							id="edit-category"
							placeholder="Category name"
							value={editingEntry.category}
							onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
						/>
					</div>

					{editingEntry.budgetSection !== "plannedPayments" && (
						<div className="inputLabelGroup">
							<label htmlFor="edit-description" className="inputLabel">Description</label>
							<textarea
								className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0 max-h-32 bg-white dark:bg-dark-base dark:border-dark-border dark:text-zinc-100"
								id="edit-description"
								placeholder="Description"
								value={editingEntry.description}
								onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
							/>
						</div>
					)}

					{editingEntry.budgetSection === "plannedPayments" ? (
						<div className="inputLabelGroup">
							<label htmlFor="edit-amount" className="inputLabel">Amount</label>
							<input
								className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0 bg-white dark:bg-dark-base dark:border-dark-border dark:text-zinc-100"
								type="number"
								id="edit-amount"
								placeholder="Amount"
								value={editingEntry.amount}
								onChange={(e) => setEditingEntry({ ...editingEntry, amount: e.target.value })}
							/>
						</div>
					) : (
						<div className="inputLabelGroup">
							<label htmlFor="edit-limit" className="inputLabel">Set Limit</label>
							<input
								className="px-4 py-2 border rounded-lg border-zinc-200 focus:outline-0 bg-white dark:bg-dark-base dark:border-dark-border dark:text-zinc-100"
								type="number"
								id="edit-limit"
								placeholder="Spending limit"
								value={editingEntry.setLimit}
								onChange={(e) => setEditingEntry({ ...editingEntry, setLimit: e.target.value })}
							/>
						</div>
					)}

					<button
						type="submit"
						className="mt-4 w-full rounded-lg bg-brand-500 py-2 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
						disabled={isEditLoading}
					>
						{isEditLoading ? (
							<div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							"Save changes"
						)}
					</button>
				</form>
			)}
		</AccessibleDialog>

		{/* Delete entry confirmation modal */}
		<AccessibleDialog
			open={isDeleteConfirmOpen}
			onClose={() => { setIsDeleteConfirmOpen(false); setDeletingEntry(null); }}
			title="Delete entry?"
			titleId="budget-delete-dialog-title"
		>
			<p className="mb-5 text-zinc-600 dark:text-zinc-400">
				This removes the budget entry permanently.
			</p>

			<div className="flex flex-row items-center justify-center gap-5">
				<button
					type="button"
					className="w-28 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
					onClick={deleteEntry}
				>
					{isDeleteEntryLoading ? (
						<div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
					) : (
						"Delete"
					)}
				</button>
				<button
					type="button"
					className="w-28 rounded-lg bg-zinc-500 px-4 py-2 text-white transition hover:bg-zinc-600"
					onClick={() => { setIsDeleteConfirmOpen(false); setDeletingEntry(null); }}
				>
					Cancel
				</button>
			</div>
		</AccessibleDialog>
		</div>
	);
};

export default BudgetScreen;
