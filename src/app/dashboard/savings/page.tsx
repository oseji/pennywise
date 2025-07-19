"use client";
import { useState, useRef, useEffect } from "react";

const SavingsPage = () => {
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
		<div className="relative  dashboardScreen">
			<div>
				<h1 className="dashboardHeading">savings</h1>

				<div className="flex flex-row items-center justify-between capitalize ">
					<h2 className="text-xl font-bold ">savings target</h2>

					<button
						className=" capitalize text-white rounded-lg px-4 py-2 bg-[#2D6A4F]"
						onClick={() => {
							setIsModalOpen(!isModalOpen);
						}}
					>
						new target
					</button>
				</div>

				{/* table header */}
				<div className=" p-4 rounded-lg bg-slate-200 text-[#2D6A4F] capitalize font-semibold grid grid-cols-5 mt-6">
					<p>purpose</p>
					<p>frequency</p>
					<p>amount</p>
					<p>target date</p>
					<p>progress</p>
				</div>

				{/* table content */}
				<div className="grid grid-cols-5 px-4 pt-5 ">
					<p>
						<span>1. </span>
						<span className="capitalize ">emergency</span>
					</p>

					<p className="capitalize ">monthly</p>

					<p>100,000</p>

					<p>dec, 2023</p>

					<p>progresssssssssssssssssssssssssssss</p>
				</div>

				<div className="flex flex-row items-center justify-between mt-10 text-sm ">
					<div className="flex flex-row items-end gap-4 ">
						<div className="w-5 h-5 p-1 bg-green-500 "></div>
						<p>Savings on track</p>
					</div>

					<div className="flex flex-row items-end gap-4 ">
						<div className="w-5 h-5 p-1 bg-yellow-500 "></div>
						<p>1 payment behind</p>
					</div>

					<div className="flex flex-row items-end gap-4 ">
						<div className="w-5 h-5 p-1 bg-red-500 "></div>
						<p>Multiple payments behind</p>
					</div>
				</div>
			</div>

			{/* Add savings Modal */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center hideIncomeModal"
				ref={modalRef}
			>
				{/* Overlay */}
				<div
					className="absolute inset-0 bg-black cursor-pointer opacity-90"
					onClick={() => setIsModalOpen(!isModalOpen)}
				></div>

				{/* Modal Content */}
				<div className={`relative z-20 bg-white rounded-lg p-8 w-96 shadow-lg`}>
					<h2 className="mb-6 text-2xl font-bold">Add Savings Target</h2>

					<form
						className="flex flex-col gap-2"
						onSubmit={(e) => {
							e.preventDefault();
						}}
					>
						<div className="inputLabelGroup">
							<label htmlFor="narration" className="inputLabel">
								Savings purpose
							</label>
							<input
								className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
								type="text"
								name="narration"
								id="narration"
								placeholder="Enter Narration"
							/>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="frequency" className="inputLabel">
								Frequency
							</label>
							<select
								name="frequency"
								id="frequency"
								className="p-2 border rounded-l  border-slate-200 focus:outline-0"
							>
								<option value="" disabled>
									Enter frequency
								</option>
								<option value="Daily">Daily</option>
								<option value="Monthly">Monthly</option>
								<option value="Yearly">Yearly</option>
							</select>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="amount" className="inputLabel">
								Target Amount
							</label>
							<input
								className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
								type="number"
								name="amount"
								id="amount"
								placeholder="Enter target amount"
							/>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="amount" className="inputLabel">
								Target date
							</label>
							<input
								className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
								type="date"
								name="date"
								id="date"
								placeholder="Enter target date"
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

export default SavingsPage;
