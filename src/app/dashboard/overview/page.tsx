"use client";

import { useState, useEffect } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { auth, db } from "@/firebase/firebase";
import { getDocs, collection, orderBy, query } from "firebase/firestore";

import toast from "react-hot-toast";
import { formatFetchError } from "@/utils/formatFetchError";
import ChartCategories from "./ChartCategories";

type userData = {
	total: number;
	categories: {
		name: string;
		percentage: number;
		totalAmount: number;
	}[];
};

type CategorySummary = {
	name: string;
	percentage: number;
	totalAmount: number;
};

type BudgetDoc = {
	amount?: number;
	setLimit?: number;
	category?: string;
};

const Dashboard = () => {
	const user = auth.currentUser;

	const [isLoading, setisLoading] = useState<boolean>(true);

	const [incomeSummary, setIncomeSummary] = useState<userData>({
		total: 0,
		categories: [],
	});
	const [expenseSummary, setExpenseSummary] = useState<userData>({
		total: 0,
		categories: [],
	});
	const [budgetSummary, setBudgetSummary] = useState<userData>({
		total: 0,
		categories: [],
	});

	const incomeChartData = incomeSummary.categories.map((item) => ({
		name: item.name,
		value: item.totalAmount,
	}));
	const expensesChartData = expenseSummary.categories.map((item) => ({
		name: item.name,
		value: item.totalAmount,
	}));
	const budgetChartData = budgetSummary.categories.map((item) => ({
		name: item.name,
		value: item.totalAmount,
	}));

	const COLORS = [
		"#FF6F61",
		"#6B5B95",
		"#88B04B",
		"#F7CAC9",
		"#92A8D1",
		"#FFB347",
		"#E94B3C",
		"#009688",
		"#FFD700",
		"#7B68EE",
	];

	const fetchUserDataSummary = async (
		userId: string
	): Promise<{
		income: userData;
		expense: userData;
	}> => {
		setisLoading(true);

		if (!userId) {
			return {
				income: { total: 0, categories: [] },
				expense: { total: 0, categories: [] },
			};
		}

		const summarize = async (collectionName: string) => {
			const ref = collection(db, `users/${userId}/${collectionName}`);
			const q = query(ref, orderBy("createdAt", "desc"));
			const snap = await getDocs(q);

			let total = 0;
			const byCat: Record<string, number> = {};

			snap.docs.forEach((doc) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const d = doc.data() as any;
				const cat = d.category as string;
				const amt = Number(d.amount) || 0;
				total += amt;
				byCat[cat] = (byCat[cat] || 0) + amt;
			});

			const categories: CategorySummary[] = Object.entries(byCat).map(
				([name, amount]) => ({
					name,
					totalAmount: amount,
					percentage: total
						? parseFloat(((amount / total) * 100).toFixed(2))
						: 0,
				})
			);

			return { total, categories };
		};

		try {
			const income = await summarize("incomeData");
			const expense = await summarize("expenseData");
			return { income, expense };
		} catch (err) {
			toast.error(formatFetchError(err));
			return {
				income: { total: 0, categories: [] },
				expense: { total: 0, categories: [] },
			};
		} finally {
			setisLoading(false);
		}
	};

	const fetchBudgetData = async (userId: string): Promise<userData> => {
		if (!userId) return { total: 0, categories: [] };

		try {
			const budgetCategories = ["others", "plannedPayments", "dailyNeeds"];

			let total = 0;
			const categories: CategorySummary[] = [];

			for (const cat of budgetCategories) {
				//fetch from subcollection "data"
				const ref = collection(db, `users/${userId}/budgetData/${cat}/data`);
				const snap = await getDocs(ref);

				let catTotal = 0;
				snap.docs.forEach((doc) => {
					const d = doc.data() as BudgetDoc;

					// Use the right field depending on what exists
					const value = d.amount ?? d.setLimit ?? 0;

					catTotal += Number(value) || 0;
				});

				total += catTotal;

				categories.push({
					name: cat,
					totalAmount: catTotal,
					percentage: 0, // placeholder
				});
			}

			const finalCategories = categories.map((c) => ({
				...c,
				percentage: total
					? parseFloat(((c.totalAmount / total) * 100).toFixed(2))
					: 0,
			}));

			return { total, categories: finalCategories };
		} catch (err) {
			toast.error(formatFetchError(err));
			return { total: 0, categories: [] };
		}
	};

	useEffect(() => {
		const load = async () => {
			if (!user?.uid) return;

			const data = await fetchUserDataSummary(user.uid);
			const budget = await fetchBudgetData(user.uid);

			if (data && budget) {
				setIncomeSummary(data.income);
				setExpenseSummary(data.expense);
				setBudgetSummary(budget);
			}
		};
		load();

		console.log(budgetSummary);
	}, [user?.uid]);

	useEffect(() => {
		console.log(incomeSummary);
		console.log(expenseSummary);
		console.log(budgetSummary);
	}, [incomeSummary, expenseSummary, budgetSummary]);

	return (
		<div className={`dashboardScreen`}>
			<h1 className="relative dashboardHeading">dashboard</h1>

			{isLoading ? (
				<div className=" min-h-[70dvh] flex flex-col items-center justify-center">
					<div className="w-16 h-16 mx-auto capitalize border-4 border-[#2D6A4F] rounded-full border-t-transparent animate-spin" />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
					<div className=" chartBox">
						<div className="chartBoxHeadingGroup">
							<h1>Income</h1>

							<span>{incomeSummary.total.toLocaleString()}</span>
						</div>

						<PieChart width={200} height={200}>
							<Pie
								data={incomeChartData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={80}
								fill="#8884d8"
								paddingAngle={1}
								dataKey="value"
								className="outline-none"
							>
								{incomeChartData.map((entry, index) => (
									<Cell
										key={`cell-${entry.name}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
						</PieChart>

						<p>This chart shows the sources of your total income.</p>

						<div className="flex flex-row justify-start w-full mt-auto">
							<ChartCategories summary={incomeSummary} limit={5} />
						</div>
					</div>

					<div className=" chartBox">
						<div className="chartBoxHeadingGroup">
							<h1>Expenditure</h1>

							<span>{expenseSummary.total.toLocaleString()}</span>
						</div>

						<PieChart width={200} height={200}>
							<Pie
								data={expensesChartData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={80}
								fill="#8884d8"
								paddingAngle={1}
								dataKey="value"
								className="outline-none"
							>
								{expensesChartData.map((entry, index) => (
									<Cell
										key={`cell-${entry.name}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
						</PieChart>

						<p>
							This chart breaks down how your total spending is categorized.
						</p>

						<div className="flex flex-row justify-start w-full mt-auto ">
							<ChartCategories summary={expenseSummary} limit={5} />
						</div>
					</div>

					<div className=" chartBox">
						<div className="chartBoxHeadingGroup">
							<h1>Budget</h1>

							<span>{budgetSummary.total.toLocaleString()}</span>
						</div>

						<PieChart width={200} height={200}>
							<Pie
								data={budgetChartData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={80}
								fill="#8884d8"
								paddingAngle={1}
								dataKey="value"
								className="outline-none"
							>
								{budgetChartData.map((entry, index) => (
									<Cell
										key={`cell-${entry.name}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
						</PieChart>

						<p>This chart illustrates how your total budget is allocated.</p>

						<div className="flex flex-row justify-start w-full mt-auto">
							<ChartCategories summary={budgetSummary} limit={5} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
