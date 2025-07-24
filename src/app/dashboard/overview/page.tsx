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

const Dashboard = () => {
	const user = auth.currentUser;

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

	const data = [
		{ name: "Group A", value: 400 },
		{ name: "Group B", value: 300 },
		{ name: "Group C", value: 300 },
		{ name: "Group D", value: 200 },
	];

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
		budget: userData;
	}> => {
		if (!userId) {
			return {
				income: { total: 0, categories: [] },
				expense: { total: 0, categories: [] },
				budget: { total: 0, categories: [] },
			};
		}

		const summarize = async (collectionName: string) => {
			const ref = collection(db, `users/${userId}/${collectionName}`);
			const q = query(ref, orderBy("createdAt", "desc"));
			const snap = await getDocs(q);

			let total = 0;
			const byCat: Record<string, number> = {};

			snap.docs.forEach((doc) => {
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
			const budget = await summarize("budgetData");
			return { income, expense, budget };
		} catch (err) {
			toast.error(formatFetchError(err));
			return {
				income: { total: 0, categories: [] },
				expense: { total: 0, categories: [] },
				budget: { total: 0, categories: [] },
			};
		}
	};

	useEffect(() => {
		const load = async () => {
			if (!user?.uid) return;
			const data = await fetchUserDataSummary(user.uid);
			if (data) {
				setIncomeSummary(data.income);
				setExpenseSummary(data.expense);
				setBudgetSummary(data.budget);
			}
		};
		load();
	}, [user?.uid]);

	useEffect(() => {
		console.log(incomeSummary);
		console.log(expenseSummary);
		console.log(budgetSummary);
	}, [incomeSummary, expenseSummary, budgetSummary]);

	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">dashboard</h1>

			<div className="flex flex-row items-center justify-between gap-10">
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
							{data.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>

					<div className="flex flex-row justify-start w-full ">
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
							{data.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>

					<div className="flex flex-row justify-start w-full ">
						<ChartCategories summary={expenseSummary} limit={5} />
					</div>
				</div>

				<div className=" chartBox">
					<div className="chartBoxHeadingGroup">
						<h1>Savings</h1>

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
							{data.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>

					<div className="flex flex-row justify-start w-full ">
						<ChartCategories summary={budgetSummary} limit={5} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
