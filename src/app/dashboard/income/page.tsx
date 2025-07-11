"use client";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import editIcon from "../../../assets/dashboard/edit icon.svg";
import deleteIcon from "../../../assets/dashboard/delete icon.svg";

type tableDataType = {
	date: string;
	narration: string;
	amount: number;
}[];

const IncomeScreen = () => {
	const tableData: tableDataType = [
		{ date: "July", narration: "testing", amount: 100000 },
		{ date: "July", narration: "testing", amount: 100000 },
		{ date: "July", narration: "testing", amount: 100000 },
		{ date: "July", narration: "testing", amount: 100000 },
	];

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
				<h1 className="dashboardHeading">income</h1>

				<p className="  font-bold my-10">
					<span className=" text-2xl">Balance: </span>{" "}
					<span className="text-5xl">1,000,000</span>
				</p>

				<div className=" flex flex-row items-center justify-between">
					<h1 className=" font-bold text-2xl">Date</h1>

					<button
						className="  bg-white border border-[#2D6A4F] text-[#2D6A4F] px-4 py-2 rounded-lg hover:scale-110 transition ease-in-out"
						onClick={() => setIsModalOpen(!isModalOpen)}
					>
						+ Add income
					</button>
				</div>

				<table className=" w-full mt-5 border-collapse table-auto">
					<thead>
						<tr className=" capitalize bg-slate-200 rounded-lg">
							<th className=" py-4 px-14 font-bold">date | time</th>
							<th className=" py-4 px-14 font-bold">narration</th>
							<th className=" py-4 px-14 font-bold">amount </th>
							<th className=" py-4 px-14 font-bold">action</th>
						</tr>
					</thead>

					<tbody className=" bg-white w-full">
						{tableData.map((item, index) => (
							<tr key={index} className=" shadow-2xl rounded-lg px-4 py-2">
								<td className=" font-medium pt-4 text-center">{item.date}</td>

								<td className=" font-medium pt-4 text-center">
									{item.narration}
								</td>

								<td className=" font-medium pt-4 text-center">{item.amount}</td>

								<td>
									<div className=" flex flex-row items-center gap-4 justify-center">
										<Image
											src={editIcon}
											alt="edit icon"
											className=" cursor-pointer hover:scale-110 transition ease-in-out"
										/>
										<Image
											src={deleteIcon}
											alt="delete icon"
											className=" cursor-pointer hover:scale-110 transition ease-in-out"
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Add Income Modal */}
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
					<h2 className="text-2xl font-bold mb-6">Add Cash Income</h2>

					<form className="flex flex-col gap-2">
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

export default IncomeScreen;
