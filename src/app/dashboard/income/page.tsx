"use client";
import { useEffect, useRef, useState } from "react";

import { db, auth } from "@/firebase/firebase";
import {
	addDoc,
	collection,
	getDocs,
	serverTimestamp,
	query,
	orderBy,
} from "firebase/firestore";

import Image from "next/image";
import { formatFetchError } from "@/utils/formatFetchError";
import { formatAddDocError } from "@/utils/formatAddDocError";

import editIcon from "../../../assets/dashboard/edit icon.svg";
import deleteIcon from "../../../assets/dashboard/delete icon.svg";
import toast from "react-hot-toast";

type tableDataType = {
	date: string;
	narration: string;
	amount: number;
}[];

const IncomeScreen = () => {
	const user = auth.currentUser;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
	const [incomeData, setIncomeData] = useState<tableDataType>([]);
	const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);

	const [incomeInput, setIncomeInput] = useState<string>("");
	const [narrationInput, setNarrationInput] = useState<string>("");

	const modalRef = useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const fetchIncomeData = async (userId: string) => {
		if (!userId) return;

		setIsDataLoading(true);

		try {
			const incomeReference = collection(db, `users/${userId}/incomeData`);
			const q = query(incomeReference, orderBy("createdAt", "desc"));

			const querySnapshot = await getDocs(q);

			const incomeList = querySnapshot.docs.map((doc) => {
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
					narration: data.narration || "",
					amount: Number(data.amount) || 0,
				};
			});

			toast.success("Income data fetched successfully");

			return incomeList;
		} catch (err) {
			const message = formatFetchError(err);
			toast.error(`${message}`);
		} finally {
			setIsDataLoading(false);
		}
	};

	const addIncome = async () => {
		if (!user) return;

		if (
			!narrationInput.trim() ||
			isNaN(Number(incomeInput)) ||
			Number(incomeInput) <= 0
		) {
			toast.error("Narration and a valid income amount are required");
			return;
		}

		setIsLoading(true);

		try {
			await addDoc(collection(db, `users/${user.uid}/incomeData`), {
				narration: narrationInput,
				amount: Number(incomeInput),
				createdAt: serverTimestamp(),
			});

			toast.success("Income added successfully");
			setIsModalOpen(false);

			const updatedData = await fetchIncomeData(user.uid);
			setIncomeData(updatedData ?? []);
		} catch (err) {
			console.log(`error adding income: ${err}`);
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);
			setNarrationInput("");
			setIncomeInput("");
		}
	};

	// fetch income data
	useEffect(() => {
		const getData = async () => {
			if (user) {
				setIncomeData((await fetchIncomeData(user.uid)) ?? []);
			}
		};
		getData();

		console.log(incomeData);
	}, []);

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
					<span className="text-5xl">{totalIncome.toLocaleString()}</span>
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

				{isDataLoading ? (
					<div>
						<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto capitalize" />
					</div>
				) : (
					<table className=" w-full mt-5 border-collapse table-auto">
						<thead>
							<tr className=" capitalize bg-slate-200 rounded-lg">
								<th className=" py-4 text-start font-bold">date | time</th>
								<th className=" py-4 text-start font-bold">narration</th>
								<th className=" py-4 text-start font-bold">amount </th>
								<th className=" py-4 text-start font-bold">action</th>
							</tr>
						</thead>

						<tbody className=" bg-white w-full">
							{incomeData.map((item, index) => (
								<tr key={index} className=" shadow-2xl rounded-lg px-4 py-2">
									<td className=" font-medium pt-4 text-start">{item.date}</td>

									<td className=" font-medium pt-4 text-start">
										{item.narration}
									</td>

									<td className=" font-medium pt-4 text-start">
										{item.amount.toLocaleString()}
									</td>

									<td>
										<div className=" flex flex-row items-center gap-4 justify-start">
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
				)}
			</div>

			{/* Add Income Modal */}
			<div
				className="fixed inset-0 z-50 flex items-center backdrop-blur-sm justify-center hideIncomeModal"
				ref={modalRef}
			>
				{/* Overlay */}
				<div
					className="absolute inset-0 bg-black opacity-50  cursor-pointer"
					onClick={() => setIsModalOpen(!isModalOpen)}
				></div>

				{/* Modal Content */}
				<div className={`relative z-20 bg-white rounded-lg p-8 w-96 shadow-lg`}>
					<h2 className="text-2xl font-bold mb-6">Add Cash Income</h2>

					<form
						className="flex flex-col gap-2"
						onSubmit={(e) => {
							e.preventDefault();

							addIncome();
						}}
					>
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
								value={narrationInput}
								onChange={(e) => setNarrationInput(e.target.value)}
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
								value={incomeInput}
								onChange={(e) => setIncomeInput(e.target.value)}
							/>
						</div>

						<button
							type="submit"
							className=" w-full py-2 rounded-lg text-white font-semibold bg-[#2D6A4F] mt-4 transition ease-in-out duration-200 hover:scale-110 capitalize"
							disabled={isLoading}
						>
							{isLoading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto " />
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

export default IncomeScreen;
