"use client";
import { useEffect, useState } from "react";
import Pagination from "@/utils/Pagination";

import { db, auth } from "@/firebase/firebase";
import {
	doc,
	setDoc,
	deleteDoc,
	collection,
	getDocs,
	serverTimestamp,
	query,
	orderBy,
	addDoc,
} from "firebase/firestore";

import Image from "next/image";
import { formatFetchError } from "@/utils/formatFetchError";
import { formatAddDocError } from "@/utils/formatAddDocError";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";

import deleteIcon from "../../../assets/dashboard/delete icon.svg";
import toast from "react-hot-toast";

type tableDataType = {
	date: string;
	narration: string;
	amount: number;
	category: string;
	id: string;
}[];

const IncomeScreen = () => {
	const user = auth.currentUser;
	const currency = usePreferencesStore((s) => s.currency);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
	const [isDeletionLoading, setIsDeletionLoading] = useState<boolean>(false);
	const [incomeData, setIncomeData] = useState<tableDataType>([]);
	const totalIncome = incomeData.reduce((sum, entry) => sum + entry.amount, 0);

	const [incomeInput, setIncomeInput] = useState<string>("");
	const [categoryInput, setCategoryInput] = useState<string>("");
	const [narrationInput, setNarrationInput] = useState<string>("");

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [selectedIdForDeletion, setSelectedIdForDeletion] =
		useState<string>("");

	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

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

			const incomeList = querySnapshot.docs.map((docSnap) => {
				const data = docSnap.data();

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
					id: docSnap.id,
				};
			});

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
			const newDocRef = doc(collection(db, `users/${user.uid}/incomeData`));

			await setDoc(newDocRef, {
				id: newDocRef.id,
				narration: narrationInput,
				category: categoryInput,
				amount: Number(incomeInput),
				createdAt: serverTimestamp(),
			});

			await addDoc(collection(db, `users/${user.uid}/notifications`), {
				notification: `${formatMoney(Number(incomeInput), currency)} was added to Income under ${categoryInput}`,
				category: categoryInput,
				amount: Number(incomeInput),
				createdAt: serverTimestamp(),
			});

			toast.success(
				`${formatMoney(Number(incomeInput), currency)} added to Income`
			);
			setIsModalOpen(false);
			setCurrentPage(1);

			const updatedData = await fetchIncomeData(user.uid);
			setIncomeData(updatedData ?? []);
		} catch (err) {
			toast.error(`${formatAddDocError(err)}`);
		} finally {
			setIsLoading(false);
			setNarrationInput("");
			setIncomeInput("");
			setCategoryInput("");
		}
	};

	const deleteIncome = async (id: string) => {
		if (!user) return;

		setIsDeletionLoading(true);

		try {
			await deleteDoc(doc(db, `users/${user.uid}/incomeData/${id}`));

			setCurrentPage(1);
			const updatedData = await fetchIncomeData(user.uid);
			setIncomeData(updatedData ?? []);

			toast.success("Income entry deleted successfully");
		} catch (err) {
			const message = formatAddDocError(err);
			toast.error(message);
		} finally {
			setSelectedIdForDeletion("");
			setIsDeleteModalOpen(false);
			setIsDeletionLoading(false);
		}
	};

	useEffect(() => {
		const getData = async () => {
			if (user) {
				setIncomeData((await fetchIncomeData(user.uid)) ?? []);
			}
		};
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mount / user session
	}, []);

	return (
		<div className="relative dashboardScreen">
			<div>
				<h1 className="dashboardHeading">income</h1>

				<p className="my-5 font-bold text-zinc-900 dark:text-zinc-100">
					<span className="text-lg md:text-xl lg:text-2xl">Balance: </span>
					<span className="text-xl md:text-2xl lg:text-5xl tabular-nums">
						{formatMoney(totalIncome, currency)}
					</span>
				</p>

				<button
					type="button"
					className="block rounded-lg border border-brand-500 bg-white px-4 py-2 text-brand-500 transition ease-in-out hover:scale-[1.02] dark:bg-dark-raised dark:text-green-400 md:ml-auto"
					onClick={() => setIsModalOpen(true)}
				>
					+ Add income
				</button>

				<div>
					{/* Mobile cards */}
					<div className="mt-5 space-y-3 md:hidden">
						{isDataLoading ? (
							<div className="space-y-3">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-dark-muted"
									/>
								))}
							</div>
						) : currentItems.length === 0 ? (
							<EmptyState
								title="No income entries yet"
								description="Add your first income entry to see it here."
							/>
						) : (
							currentItems.map((element) => (
								<div
									key={element.id}
									className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-raised"
								>
									<div className="flex flex-row items-start justify-between gap-2">
										<div>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												{element.date}
											</p>
											<p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
												{element.narration}
											</p>
											<p className="mt-1 text-xs font-semibold capitalize text-brand-500 dark:text-green-400">
												{element.category}
											</p>
										</div>
										<div className="text-right">
											<p className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
												{formatMoney(element.amount, currency)}
											</p>
											<button
												type="button"
												className="mt-2 text-sm text-red-600 dark:text-red-400"
												onClick={() => {
													setSelectedIdForDeletion(element.id);
													setIsDeleteModalOpen(true);
												}}
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{/* Desktop table */}
					<div className="mt-5 hidden text-sm md:block">
						<div className="dataTableHeader grid w-full min-w-[720px] grid-cols-4 rounded-t-xl">
							<p className="text-center">date | time</p>
							<p className="text-start">narration</p>
							<p className="text-center">amount</p>
							<p className="text-center">action</p>
						</div>

						{isDataLoading ? (
							<div className="dataTableSurface min-h-[45dvh] space-y-3 p-4">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<div
										key={i}
										className="h-12 animate-pulse rounded-lg bg-zinc-200 dark:bg-dark-muted"
									/>
								))}
							</div>
						) : currentItems.length === 0 ? (
							<div className="dataTableSurface min-h-[40dvh]">
								<EmptyState
									title="No income entries yet"
									description="Add your first income entry to see it here."
								/>
							</div>
						) : (
							<div className="dataTableSurface min-h-[50dvh] p-2 md:p-4">
								{currentItems.map((element) => (
									<div
										className="grid grid-cols-4 border-b border-zinc-100 py-4 last:border-0 dark:border-dark-border"
										key={element.id}
									>
										<p className="text-center text-zinc-700 dark:text-zinc-300">
											{element.date}
										</p>

										<p className="text-zinc-900 dark:text-zinc-100">
											{element.narration}
										</p>

										<div className="text-center">
											<p className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
												{formatMoney(element.amount, currency)}
											</p>
											<p className="text-xs font-semibold capitalize text-brand-500 dark:text-green-400">
												{element.category}
											</p>
										</div>

										<div className="flex flex-row items-center justify-center gap-4">
											<button
												type="button"
												className="rounded-lg p-1 transition hover:bg-zinc-100 dark:hover:bg-dark-overlay"
												onClick={() => {
													setSelectedIdForDeletion(element.id);
													setIsDeleteModalOpen(true);
												}}
												aria-label="Delete income entry"
											>
												<Image
													src={deleteIcon}
													alt=""
													className="h-6 w-6 cursor-pointer transition ease-in-out hover:scale-110"
												/>
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{totalPages > 1 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={incomeData.length}
							itemsPerPage={itemsPerPage}
							paginationRange={paginationRange}
							onPageChange={setCurrentPage}
						/>
					)}
				</div>
			</div>

			<AccessibleDialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Add cash income"
				titleId="income-add-dialog-title"
			>
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
							className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
							type="text"
							name="narration"
							id="narration"
							placeholder="Enter narration"
							value={narrationInput}
							onChange={(e) => setNarrationInput(e.target.value)}
						/>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="income-category" className="inputLabel">
							Category
						</label>

						<select
							name="income-category"
							id="income-category"
							className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
							value={categoryInput}
							onChange={(e) => setCategoryInput(e.target.value)}
						>
							<option value="" disabled>
								Select a category
							</option>
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
							className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
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
						className="mt-4 w-full rounded-lg bg-brand-500 py-2 font-semibold capitalize text-white transition duration-200 ease-in-out hover:opacity-95 disabled:opacity-60"
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

			<AccessibleDialog
				open={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Delete income?"
				titleId="income-delete-dialog-title"
			>
				<p className="mb-5 text-zinc-600 dark:text-zinc-400">
					This removes the entry permanently. This cannot be undone.
				</p>

				<div className="flex flex-row items-center justify-center gap-5">
					<button
						type="button"
						className="w-28 rounded-lg bg-red-500 px-4 py-2 text-white transition duration-200 ease-in-out hover:bg-red-600"
						onClick={() => {
							deleteIncome(selectedIdForDeletion);
						}}
					>
						{isDeletionLoading ? (
							<div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							"Delete"
						)}
					</button>
					<button
						type="button"
						className="w-28 rounded-lg bg-zinc-500 px-4 py-2 text-white transition duration-200 ease-in-out hover:bg-zinc-600 dark:bg-dark-muted"
						onClick={() => setIsDeleteModalOpen(false)}
					>
						Cancel
					</button>
				</div>
			</AccessibleDialog>
		</div>
	);
};

export default IncomeScreen;
