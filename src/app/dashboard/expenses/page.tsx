"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import searchIcon from "../../../assets/dashboard/search.svg";

const ExpensesPage = () => {
	const modalRef = useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
				<h1 className="dashboardHeading">expenses</h1>

				<h3 className="mt-10 font-semibold mb-2">Search Transaction</h3>

				<form
					className=" flex flex-row items-end gap-4"
					onSubmit={(e) => {
						e.preventDefault();
					}}
				>
					<div className=" inputLabelGroup">
						<label htmlFor="from-date-picker" className="inputLabel text-sm">
							from
						</label>

						<input
							type="date"
							name="from-date-picker"
							id="from-date-picker"
							placeholder="From"
							className=" p-2 border border-slate-200 rounded-lg"
						/>
					</div>

					<div className=" inputLabelGroup">
						<label htmlFor="to-date-picker" className="inputLabel text-sm">
							to
						</label>

						<input
							type="date"
							name="to-date-picker"
							id="to-date-picker"
							placeholder="To"
							className=" p-2 border border-slate-200 rounded-lg"
						/>
					</div>

					<button className=" rounded-lg bg-[#2D6A4F] px-4 py-2 ml-5 mb-0.5 transition-all duration-200 ease-in-out hover:scale-110">
						<Image src={searchIcon} alt="search button" />
					</button>
				</form>

				<div>
					<div className=" w-full grid grid-cols-4 capitalize bg-[#2D6A4F] p-4 text-white rounded-lg mt-10">
						<p>category</p>
						<p>narration</p>
						<p>time</p>
						<p>amount</p>
					</div>

					<div className=" bg-white p-4 rounded-lg shadow-md mt-5 ">
						<div className=" flex flex-row justify-between items-center border-b border-slate-200">
							<p className=" text-[#2D6A4F] font-semibold">date</p>

							<button
								className=" text-[#004FFF] font-semibold"
								onClick={() => {
									setIsModalOpen(!isModalOpen);
								}}
							>
								+ Add
							</button>
						</div>

						<div className=" grid grid-cols-4">
							<p className=" pt-2 capitalize">transportation</p>
							<p className=" pt-2">uber</p>
							<p className=" pt-2">today/12:30</p>
							<p className=" pt-2">-3,000</p>
							<p className=" pt-2"></p>
						</div>
					</div>
				</div>
			</div>

			{/* Add expense Modal */}
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
					<h2 className="text-2xl font-bold mb-6">Add Expenditure</h2>

					<form
						className="flex flex-col gap-2"
						onSubmit={(e) => {
							e.preventDefault();
						}}
					>
						<div className="inputLabelGroup">
							<label htmlFor="category" className="inputLabel">
								Category
							</label>
							<select
								name="category"
								id="category"
								className=" border border-slate-200 rounded-l p-2 focus:outline-0"
							>
								<option value="" disabled>
									Enter category
								</option>
								<option value="Transportation">Transportation</option>
								<option value="Entertainment">Entertainment</option>
								<option value="Food">Food</option>
								<option value="Clothing">Clothing</option>
								<option value="Other">Other</option>
							</select>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="narration" className="inputLabel">
								Narration
							</label>
							<input
								className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
								type="text"
								name="narration"
								id="narration"
								placeholder="Enter Narration"
							/>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="amount" className="inputLabel">
								Amount
							</label>
							<input
								className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
								type="number"
								name="amount"
								id="amount"
								placeholder="Enter amount"
							/>
						</div>

						<button className=" w-full py-2 rounded-lg text-white font-semibold bg-[#2D6A4F] mt-4 transition ease-in-out duration-200 hover:scale-110">
							Add
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ExpensesPage;
