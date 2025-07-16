"use client";
import { useState, useRef, useEffect } from "react";
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

const BudgetScreen = () => {
	const user = auth.currentUser;

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [dataLoading, setDataLoading] = useState<boolean>(false);

	const modalRef = useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedModal, setSelectedModal] = useState<
		"daily needs" | "planned payments" | "others"
	>("daily needs");

	type budgetDataType = {
		category: string;
		description: string | null;
		amount: number | null;
		setLimit: number;
		frequency: string | null;
		date: string;
	}[];

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
	const [plannedPaymentsFrequencyInput, setPlannedPaymentsFrequencyInput] =
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
				!plannedPaymentsAmountInput.trim() ||
				!plannedPaymentsFrequencyInput.trim()
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

					frequency:
						selectedCategory === "planned payments"
							? plannedPaymentsFrequencyInput
							: null,
				}
			);

			toast.success(`${selectedModal} entry added successfully`);

			fetchBudgetData(user.uid);
			setIsModalOpen(false);
		} catch (err) {
			console.log(`error adding entry: ${err}`);
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);

			setDailyNeedsCategoryInput("");
			setDailyNeedsDescriptionInput("");
			setDailyNeedsLimitInput("");
			setPlannedPaymentsCategoryInput("");
			setPlannedPaymentsAmountInput("");
			setPlannedPaymentsFrequencyInput("");
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
						frequency: data.frequency || "",
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

			toast.success("Budget categories fetched successfully");
		} catch (err) {
			const message = formatFetchError(err);
			console.log(err);
			toast.error(`${message}`);
		} finally {
			setDataLoading(false);
		}
	};

	// fetch budget data
	useEffect(() => {
		if (user) {
			fetchBudgetData(user.uid);
		}
	}, [user]);

	// toggle modal
	useEffect(() => {
		if (isModalOpen) {
			modalRef.current?.classList.remove("hideIncomeModal");
		}

		if (!isModalOpen) {
			modalRef.current?.classList.add("hideIncomeModal");
		}
	}, [isModalOpen]);

	return (
		<div className=" dashboardScreen relative">
			<div>
				<h1 className="dashboardHeading">budget</h1>

				{/* daily needs */}
				<div className="  w-full px-6 py-10 bg-white rounded-lg mb-6 shadow-md">
					<div className=" flex flex-row items-center justify-between border-b border-slate-200 pb-3">
						<h1 className=" capitalize text-2xl font-bold">daily needs</h1>

						<button
							className=" dailyNeedsAddButton"
							onClick={() => {
								setIsModalOpen(!isModalOpen);
								setSelectedModal("daily needs");
							}}
						>
							{selectedModal === "daily needs" && dataLoading ? (
								<div className="w-5 h-5 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto capitalize" />
							) : (
								"+ New Category"
							)}
						</button>
					</div>

					<table className="table-fixed border-separate border-spacing-x-4 w-full mt-4">
						<colgroup>
							<col className=" w-72" />
							<col className="w-32" />
							<col className="w-32" />
							<col className="w-60" />
						</colgroup>

						<thead className="capitalize">
							<tr>
								<th className="text-start">category</th>
								<th className="text-start">set limit</th>
								<th className="text-start">amount spent</th>
								<th className="text-start">status</th>
							</tr>
						</thead>

						<tbody>
							{dailyNeedsData.map((element, index) => (
								<tr className=" border-b border-slate-200" key={index}>
									<td className=" py-4">
										<div className="flex flex-col gap-2">
											<p className=" capitalize">{element.category}</p>
											<p className="text-xs">
												<span className="text-[#52B788]">Description: </span>
												<span className="italic">{element.description}</span>
											</p>
										</div>
									</td>

									<td className=" py-4">{element.setLimit.toLocaleString()}</td>
									<td className=" py-4">120000</td>
									<td className=" py-4 flex flex-row items-center gap-8">
										<div className=" w-64 h-3 rounded-full bg-slate-100">
											<div className=" bg-red-400 rounded-full h-3 w-[40%]"></div>
										</div>

										<Image
											src={editIcon}
											alt=" edit icon"
											className=" cursor-pointer hover:scale-110 transition-all ease-in-out duration-200"
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* planned payments */}
				<div className="  w-full px-6 py-10 bg-white rounded-lg mb-6 shadow-md">
					<div className=" flex flex-row items-center justify-between border-b border-slate-200 pb-3">
						<h1 className=" capitalize text-2xl font-bold">planned payments</h1>

						<button
							className=" dailyNeedsAddButton"
							onClick={() => {
								setIsModalOpen(!isModalOpen);
								setSelectedModal("planned payments");
							}}
						>
							{selectedModal === "planned payments" && dataLoading ? (
								<div className="w-5 h-5 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto capitalize" />
							) : (
								"+ New Category"
							)}
						</button>
					</div>

					<table className="table-fixed w-full mt-4">
						<thead className="capitalize">
							<tr>
								<th className="text-start">category</th>
								<th className="text-start">amount</th>
								<th className="text-start">frequency</th>
							</tr>
						</thead>

						<tbody>
							{plannedPaymentsData.map((element, index) => (
								<tr className=" border-b border-slate-200" key={index}>
									<td className=" py-4 capitalize">{element.category}</td>
									<td className=" py-4">{element.amount?.toLocaleString()}</td>
									<td className=" py-4 capitalize">{element.frequency}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* others */}
				<div className="  w-full px-6 py-10 bg-white rounded-lg mb-6 shadow-md">
					<div className="  border-b border-slate-200 pb-3">
						<div className=" flex flex-row items-center justify-between">
							<h1 className=" capitalize text-2xl font-bold">others</h1>

							<button
								className=" dailyNeedsAddButton"
								onClick={() => {
									setIsModalOpen(!isModalOpen);
									setSelectedModal("others");
								}}
							>
								{selectedModal === "others" && dataLoading ? (
									<div className="w-5 h-5 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto capitalize" />
								) : (
									"+ New Entry"
								)}
							</button>
						</div>

						<p className=" text-sm">
							Includes expenditures that do not fit into pre existing
							categories.
						</p>
					</div>

					<table className="table-fixed w-full mt-4">
						<colgroup>
							<col className="w-72" />
							<col className="w-32" />
							<col className="w-32" />
							<col className="w-64" />
						</colgroup>

						<thead className="capitalize">
							<tr>
								<th className="text-start">category</th>
								<th className="text-start">set limit</th>
								<th className="text-start">amount spent</th>
								<th className="text-start">status</th>
							</tr>
						</thead>

						<tbody>
							{othersData.map((element, index) => (
								<tr className=" border-b border-slate-200" key={index}>
									<td className=" py-4">
										<div className="flex flex-col gap-2">
											<p className=" capitalize">{element.category}</p>
											<p className="text-xs">
												<span className="text-[#52B788]">Description: </span>
												<span className="italic">{element.description}</span>
											</p>
										</div>
									</td>

									<td className=" py-4">{element.setLimit.toLocaleString()}</td>
									<td className=" py-4">120000</td>
									<td className=" py-4 flex flex-row items-center gap-8">
										<div className=" w-64 h-3 rounded-full bg-slate-100">
											<div className=" bg-yellow-400 rounded-full h-3 w-[40%]"></div>
										</div>

										<Image
											src={editIcon}
											alt=" edit icon"
											className=" cursor-pointer hover:scale-110 transition-all ease-in-out duration-200"
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modals */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm hideIncomeModal"
				ref={modalRef}
			>
				{/* Overlay */}
				<div
					className="absolute inset-0 bg-black opacity-50 cursor-pointer"
					onClick={() => setIsModalOpen(!isModalOpen)}
				></div>

				{/* Modal Content */}
				<div className={`relative z-20 bg-white rounded-lg p-8 w-96 shadow-lg`}>
					{selectedModal === "daily needs" ? (
						<h2 className="text-2xl font-bold mb-6">Add Daily Needs</h2>
					) : (
						""
					)}
					{selectedModal === "planned payments" ? (
						<h2 className="text-2xl font-bold mb-6">Add Planned Payments</h2>
					) : (
						""
					)}
					{selectedModal === "others" ? (
						<h2 className="text-2xl font-bold mb-6">Add Others</h2>
					) : (
						""
					)}

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
									className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
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
									className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0 max-h-32"
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
									className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
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
									className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
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
									Amount
								</label>
								<input
									type="number"
									className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
									name="set-amount"
									id="set-amount"
									placeholder="Set amount"
									value={plannedPaymentsAmountInput}
									onChange={(e) =>
										setPlannedPaymentsAmountInput(e.target.value)
									}
								/>
							</div>
						) : (
							""
						)}

						{selectedModal === "planned payments" ? (
							<div className="inputLabelGroup">
								<label htmlFor="set-frequency" className="inputLabel">
									frequency
								</label>

								<select
									name="set-frequency"
									id="set-frequency"
									className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
									value={plannedPaymentsFrequencyInput}
									onChange={(e) =>
										setPlannedPaymentsFrequencyInput(e.target.value)
									}
								>
									<option value="daily">Daily</option>
									<option value="monthly">Monthly</option>
									<option value="yearly">Yearly</option>
								</select>
							</div>
						) : (
							""
						)}

						<button className=" w-full py-2 rounded-lg text-white font-semibold bg-[#2D6A4F] mt-4 transition ease-in-out duration-200 hover:scale-110">
							{isLoading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto capitalize" />
							) : (
								"Add"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default BudgetScreen;
