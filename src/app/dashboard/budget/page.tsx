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
	category: string;
	description: string | null;
	amount: number | null;
	setLimit: number;
	date: string;
}[];

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

				return snapshot.docs.map((doc) => {
					const data = doc.data();

					return {
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
								className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
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
											<tr className="border-b border-slate-200 dark:border-slate-700" key={index}>
												<td className="tableStickyCell py-4">
													<div className="flex flex-col gap-2">
														<p className="capitalize">{element.category}</p>
														<p className="text-xs">
															<span className="text-[#52B788] dark:text-[#95D5B2]">
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

													<Image
														src={editIcon}
														alt="edit icon"
														className="budgetEditIcon"
													/>
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
											<tr className="border-b border-slate-200 dark:border-slate-700" key={index}>
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

													<Image
														src={editIcon}
														alt="edit icon"
														className="budgetEditIcon"
													/>
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
							<div className="pb-3 border-b border-slate-200">
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
											<tr className="border-b border-slate-200 dark:border-slate-700" key={index}>
												<td className="tableStickyCell py-4">
													<div className="flex flex-col gap-2">
														<p className="capitalize">{element.category}</p>
														<p className="text-xs">
															<span className="text-[#52B788] dark:text-[#95D5B2]">
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

													<Image
														src={editIcon}
														alt="edit icon"
														className="budgetEditIcon"
													/>
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
									className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
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
									className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0 max-h-32"
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
									className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
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
									className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
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
									className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
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
		</div>
	);
};

export default BudgetScreen;
