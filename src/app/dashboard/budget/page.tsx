"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import editIcon from "../../../assets/dashboard/edit icon.svg";

const BudgetScreen = () => {
	const [isPaid, setIsPaid] = useState<boolean>(false);
	const toggleBtnRef = useRef<HTMLDivElement>(null);

	const modalRef = useRef<HTMLDivElement>(null);
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
	const [plannedPaymentsFrequencyInput, setPlannedPaymentsFrequencyInput] =
		useState<string>("");

	// others
	const [othersCategoryInput, setOthersCategoryInput] = useState<string>("");
	const [othersDescriptionInput, setOthersDescriptionInput] =
		useState<string>("");
	const [othersLimitInput, setOthersLimitInput] = useState<string>("");

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
							className=" text-[#2D6A4F] bg-white border border-[#2D6A4F] rounded-lg px-6 py-2 font-semibold transition ease-in-out duration-200 hover:scale-110"
							onClick={() => {
								setIsModalOpen(!isModalOpen);
								setSelectedModal("daily needs");
							}}
						>
							+ New Category
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
							<tr className=" border-b border-slate-200">
								<td className=" py-4">
									<div className="flex flex-col gap-2">
										<p>personal care</p>
										<p className="text-xs">
											<span className="text-[#52B788]">Description: </span>
											<span className="italic">
												Includes items such as toiletries, skin care, cravings,
												sanitary items etc
											</span>
										</p>
									</div>
								</td>

								<td className=" py-4">150000</td>
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
						</tbody>
					</table>
				</div>

				{/* planned payments */}
				<div className="  w-full px-6 py-10 bg-white rounded-lg mb-6 shadow-md">
					<div className=" flex flex-row items-center justify-between border-b border-slate-200 pb-3">
						<h1 className=" capitalize text-2xl font-bold">planned payments</h1>

						<button
							className=" text-[#2D6A4F] bg-white border border-[#2D6A4F] rounded-lg px-6 py-2 font-semibold transition ease-in-out duration-200 hover:scale-110"
							onClick={() => {
								setIsModalOpen(!isModalOpen);
								setSelectedModal("planned payments");
							}}
						>
							+ New Category
						</button>
					</div>

					<table className="table-fixed w-full mt-4">
						<thead className="capitalize">
							<tr>
								<th className="text-start">category</th>
								<th className="text-start">amount</th>
								<th className="text-start">frequency</th>
								<th className="text-start">status</th>
							</tr>
						</thead>

						<tbody>
							<tr className=" border-b border-slate-200">
								<td className=" py-4 capitalize">rent</td>
								<td className=" py-4">150000</td>
								<td className=" py-4 capitalize">monthly</td>
								<td className=" py-4">
									<div className=" flex flex-row items-center gap-4">
										<div
											className={`relative  px-1 py-1 rounded-2xl w-14 h-6 cursor-pointer  ${
												isPaid ? "bg-[#219653]" : "bg-slate-400"
											}`}
											onClick={() => {
												toggleBtnRef.current?.classList.toggle("isPaid");
												toggleBtnRef.current?.classList.toggle("isNotPaid");

												setIsPaid(!isPaid);
											}}
										>
											<div
												ref={toggleBtnRef}
												className="absolute top-1/2 -translate-y-1/2 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ease-in-out isNotPaid"
											></div>
										</div>

										<span
											className={isPaid ? " text-[#27AE60]" : " text-black"}
										>
											{isPaid ? "Paid" : "Not Paid"}
										</span>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* others */}
				<div className="  w-full px-6 py-10 bg-white rounded-lg mb-6 shadow-md">
					<div className="  border-b border-slate-200 pb-3">
						<div className=" flex flex-row items-center justify-between">
							<h1 className=" capitalize text-2xl font-bold">others</h1>

							<button
								className=" text-[#2D6A4F] bg-white border border-[#2D6A4F] rounded-lg px-6 py-2 font-semibold transition ease-in-out duration-200 hover:scale-110"
								onClick={() => {
									setIsModalOpen(!isModalOpen);
									setSelectedModal("others");
								}}
							>
								+ New Entry
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
							<tr className=" border-b border-slate-200">
								<td className=" py-4">
									<div className="flex flex-col gap-2">
										<p>data</p>
										<p className="text-xs">
											<span className="text-[#52B788]">Description: </span>
											<span className="italic">
												bought data for airtel mifi
											</span>
										</p>
									</div>
								</td>

								<td className=" py-4">150000</td>
								<td className=" py-4">120000</td>
								<div className=" w-64 h-3 rounded-full bg-slate-100">
									<div className=" bg-green-400 rounded-full h-3 w-[70%]"></div>
								</div>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Modals */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center hideIncomeModal"
				ref={modalRef}
			>
				{/* Overlay */}
				<div
					className="absolute inset-0 bg-black opacity-90 cursor-pointer"
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

					<form className="flex flex-col gap-2">
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
							Add
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default BudgetScreen;
