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
import { formatAddDocError } from "@/utils/formatAddDocError";

import searchIcon from "../../../assets/dashboard/search.svg";

type expenseDataType = {
	category: string;
	subCategory: string;
	amount: number;
	narration: string;
	date: string;
}[];

const ExpensesPage = () => {
	const user = auth.currentUser;

	const modalRef = useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

	const [expenseData, setExpenseData] = useState<expenseDataType>([]);

	const [selectedCategory, setSelectedCategory] = useState("");
	const [subCategories, setSubCategories] = useState<string[]>([]);

	const [categoryInput, setCategoriesInput] = useState<string>("");
	const [subCategoryInput, setSubCategoryInput] = useState<string>("");
	const [narrationInput, setNarrationInput] = useState<string>("");
	const [amountInput, setAmountInput] = useState<string>("");

	const fetchExpenses = async (userId: string) => {
		if (!user) setIsDataLoading(true);

		try {
			const incomeReference = collection(db, `users/${userId}/expenseData`);
			const q = query(incomeReference, orderBy("createdAt", "desc"));

			const querySnapshot = await getDocs(q);

			const expenseList = querySnapshot.docs.map((doc) => {
				const data = doc.data();

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
				};
			});

			toast.success("Expenses data fetched successfully");

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
			toast.error("All fields are required and amount must be a valid number");
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

			toast.success("Expense added successfully");

			setIsModalOpen(false);

			const updatedData = await fetchExpenses(user.uid);
			setExpenseData(updatedData ?? []);
		} catch (err) {
			console.log(`error adding expense: ${err}`);
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);

			setCategoriesInput("");
			setSubCategoryInput("");
			setNarrationInput("");
			setAmountInput("");
		}
	};

	// fetch sub categories on category change
	useEffect(() => {
		const fetchSubCategories = async () => {
			if (!user?.uid || !selectedCategory) return;

			// Map UI label to Firestore collection key
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

			querySnapshot.forEach((doc) => {
				const data = doc.data();
				if (data.category) {
					fetchedCategories.add(data.category);
				}
			});

			setSubCategories(Array.from(fetchedCategories));
		};

		fetchSubCategories();
	}, [selectedCategory, user?.uid]);

	// fetch expense data
	useEffect(() => {
		const getData = async () => {
			if (user) {
				setExpenseData((await fetchExpenses(user.uid)) ?? []);
			}
		};
		getData();

		console.log(expenseData);
	}, []);

	useEffect(() => {
		console.log(selectedCategory);
	}, [selectedCategory]);
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
							<p className=" text-[#2D6A4F] font-semibold">DAY</p>

							<button
								className=" text-[#004FFF] font-semibold"
								onClick={() => {
									setIsModalOpen(!isModalOpen);
								}}
							>
								{isDataLoading ? (
									<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto capitalize" />
								) : (
									"+ Add"
								)}
							</button>
						</div>

						{expenseData.map((element, index) => (
							<div className=" grid grid-cols-4" key={index}>
								<div className=" pt-2 capitalize">
									<p>{element.category}</p>
									<p className=" text-sm text-[#2D6A4F]">
										{element.subCategory}
									</p>
								</div>

								<p className=" pt-2">{element.narration}</p>
								<p className=" pt-2">{element.date}</p>
								<p className=" pt-2">{element.amount.toLocaleString()}</p>
								<p className=" pt-2"></p>
							</div>
						))}
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

							addExpense();
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

						<div className=" inputLabelGroup">
							<label htmlFor="subcategory" className="inputLabel">
								Sub Category
							</label>

							<select
								name="subcategory"
								id="subcategory"
								className=" capitalize px-4 py-2 rounded-lg border border-slate-200 focus:outline-0"
								// size={5}
								value={subCategoryInput}
								onChange={(e) => {
									setSubCategoryInput(e.target.value);
								}}
							>
								<option value="" disabled>
									Select a sub category
								</option>

								{subCategories.map((element, index) => (
									<option value={element} key={index} className=" capitalize">
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
								value={amountInput}
								onChange={(e) => setAmountInput(e.target.value)}
							/>
						</div>

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

export default ExpensesPage;
