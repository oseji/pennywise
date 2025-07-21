"use client";
import { useEffect, useRef, useState } from "react";
import Pagination from "@/utils/Pagination";

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
import { getPaginationRange } from "@/utils/getPaginationRange";

import editIcon from "../../../assets/dashboard/edit icon.svg";
import deleteIcon from "../../../assets/dashboard/delete icon.svg";
import toast from "react-hot-toast";

type tableDataType = {
	date: string;
	narration: string;
	amount: number;
	category: string;
}[];

const IncomeScreen = () => {
	const user = auth.currentUser;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
	const [incomeData, setIncomeData] = useState<tableDataType>([]);
	const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);

	const [incomeInput, setIncomeInput] = useState<string>("");
	const [categoryInput, setCategoryInput] = useState<string>("");
	const [narrationInput, setNarrationInput] = useState<string>("");

	const modalRef = useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = incomeData.slice(indexOfFirstItem, indexOfLastItem);

	const totalPages = Math.ceil(incomeData.length / itemsPerPage);
	const paginationRange = getPaginationRange(currentPage, totalPages);

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
					category: data.category,
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
				category: categoryInput,
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
			setCategoryInput("");
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
		<div className="relative dashboardScreen">
			<div>
				<h1 className="dashboardHeading">income</h1>

				<p className="my-5 font-bold ">
					<span className="text-2xl ">Balance: </span>{" "}
					<span className="text-5xl">{totalIncome.toLocaleString()}</span>
				</p>

				<button
					className="  bg-white border border-[#2D6A4F] text-[#2D6A4F] ml-auto block px-4 py-2 rounded-lg hover:scale-110 transition ease-in-out"
					onClick={() => setIsModalOpen(!isModalOpen)}
				>
					+ Add income
				</button>

				{isDataLoading ? (
					<div>
						<div className="w-5 h-5 mx-auto capitalize border-2 border-white rounded-full border-t-transparent animate-spin" />
					</div>
				) : (
					<div>
						<div className=" w-full grid grid-cols-4 capitalize bg-[#2D6A4F] p-4 text-white rounded-lg mt-5 font-bold">
							<p className="text-center ">date | time</p>
							<p className=" text-start">narration</p>
							<p className="text-center ">amount</p>
							<p className="text-center ">action</p>
						</div>

						<div className="p-4 mt-4 bg-white rounded-lg h-[45dvh] shadow">
							{currentItems.map((element, index) => (
								<div className="grid grid-cols-4 py-4" key={index}>
									<p className="text-center ">{element.date}</p>

									<p>{element.narration}</p>

									<div className="text-center ">
										<p>{element.amount.toLocaleString()}</p>
										<p className="text-xs font-semibold capitalize text-[#2D6A4F]">
											{element.category}
										</p>
									</div>

									<div className="flex flex-row items-center justify-center gap-4 ">
										<Image
											src={editIcon}
											alt="edit icon"
											className="transition ease-in-out cursor-pointer hover:scale-110"
										/>
										<Image
											src={deleteIcon}
											alt="delete icon"
											className="transition ease-in-out cursor-pointer hover:scale-110"
										/>
									</div>
								</div>
							))}
						</div>

						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							paginationRange={paginationRange}
							onPageChange={setCurrentPage}
						/>
					</div>
				)}
			</div>

			{/* Add Income Modal */}
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
					<h2 className="mb-6 text-2xl font-bold">Add Cash Income</h2>

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
								className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
								type="text"
								name="narration"
								id="narration"
								placeholder="Enter Narration"
								value={narrationInput}
								onChange={(e) => setNarrationInput(e.target.value)}
							/>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="category" className="inputLabel">
								Category
							</label>

							<select
								name="set-frequency"
								id="set-frequency"
								className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
								value={categoryInput}
								onChange={(e) => setCategoryInput(e.target.value)}
							>
								<option value="salary">Salary</option>
								<option value="allowance">Allowance</option>
								<option value="gift">Gift</option>
								<option value="petty cash">Petty Cash</option>
							</select>
						</div>

						<div className="inputLabelGroup">
							<label htmlFor="amount" className="inputLabel">
								Amount
							</label>
							<input
								className="px-4 py-2 border rounded-lg border-slate-200 focus:outline-0"
								type="number"
								name="amount"
								id="amount"
								placeholder="Enter Amount"
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
								<div className="w-5 h-5 mx-auto border-2 border-white rounded-full border-t-transparent animate-spin " />
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
