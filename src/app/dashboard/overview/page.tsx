"use client";

import { useState, useEffect, useMemo } from "react";
import {
	Cell,
	Pie,
	PieChart,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

import { auth, db } from "@/firebase/firebase";
import { getDocs, collection, orderBy, query } from "firebase/firestore";

import toast from "react-hot-toast";
import { formatFetchError } from "@/utils/formatFetchError";
import ChartCategories from "./ChartCategories";
import { EmptyState } from "@/components/EmptyState";
import { DashboardChartSkeleton } from "@/components/DashboardChartSkeleton";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";

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

const BUDGET_LABEL_MAP: Record<string, string> = {
	others: "Others",
	plannedPayments: "Planned payments",
	dailyNeeds: "Daily needs",
};

const Dashboard = () => {
	const user = auth.currentUser;
	const currency = usePreferencesStore((s) => s.currency);

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

	const incomeChartData = useMemo(
		() =>
			incomeSummary.categories.map((item) => ({
				name: item.name,
				value: item.totalAmount,
			})),
		[incomeSummary.categories]
	);
	const expensesChartData = useMemo(
		() =>
			expenseSummary.categories.map((item) => ({
				name: item.name,
				value: item.totalAmount,
			})),
		[expenseSummary.categories]
	);
	const budgetChartData = useMemo(
		() =>
			budgetSummary.categories.map((item) => ({
				name: BUDGET_LABEL_MAP[item.name] ?? item.name,
				value: item.totalAmount,
			})),
		[budgetSummary.categories]
	);

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
				const ref = collection(db, `users/${userId}/budgetData/${cat}/data`);
				const snap = await getDocs(ref);

				let catTotal = 0;
				snap.docs.forEach((doc) => {
					const d = doc.data() as BudgetDoc;

					const value = d.amount ?? d.setLimit ?? 0;

					catTotal += Number(value) || 0;
				});

				total += catTotal;

				categories.push({
					name: cat,
					totalAmount: catTotal,
					percentage: 0,
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
	}, [user?.uid]);

	const chartTooltip = ({
		active,
		payload,
	}: {
		active?: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		payload?: any[];
	}) => {
		if (!active || !payload?.length) return null;
		const row = payload[0];
		const name = String(row.name ?? row.payload?.name ?? "");
		const value = Number(row.value ?? row.payload?.value ?? 0);
		const pct = row.payload?.percentage ?? null;
		return (
			<div className="rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2.5 text-sm shadow-card-md dark:border-dark-border dark:bg-dark-overlay">
				<p className="font-semibold capitalize text-zinc-900 dark:text-zinc-50">
					{name}
				</p>
				<p className="tabular-nums text-zinc-600 dark:text-zinc-300">
					{formatMoney(value, currency)}
					{pct !== null && <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">{pct}%</span>}
				</p>
			</div>
		);
	};

	const renderPie = (
		data: { name: string; value: number }[],
		summary: userData,
		labelMap?: Record<string, string>
	) => {
		if (data.length === 0 || summary.total === 0) {
			return (
				<EmptyState
					title="No data yet"
					description="Add entries on the Income or Expenses pages to see this chart."
				/>
			);
		}

		return (
			<>
				<div className="h-[220px] w-full min-w-0 shrink-0">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Tooltip content={chartTooltip} />
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={88}
								paddingAngle={1}
								dataKey="value"
								nameKey="name"
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
					</ResponsiveContainer>
				</div>
				<div className="mt-auto flex w-full flex-row justify-start">
					<ChartCategories
						summary={summary}
						limit={5}
						labelMap={labelMap}
					/>
				</div>
			</>
		);
	};

	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">dashboard</h1>

			{isLoading ? (
				<DashboardChartSkeleton />
			) : (
				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
					{[
						{ title: "Income",      total: incomeSummary.total,   data: incomeChartData,   summary: incomeSummary,   labelMap: undefined },
						{ title: "Expenditure", total: expenseSummary.total,  data: expensesChartData, summary: expenseSummary,  labelMap: undefined },
						{ title: "Budget",      total: budgetSummary.total,   data: budgetChartData,   summary: budgetSummary,   labelMap: BUDGET_LABEL_MAP },
					].map(({ title, total, data, summary, labelMap }) => (
						<div key={title} className="chartBox">
							<div className="chartBoxHeadingGroup">
								<div>
									<p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
										{title}
									</p>
									<p className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
										{formatMoney(total, currency)}
									</p>
								</div>
								<div className={`h-2.5 w-2.5 rounded-full ${total > 0 ? "bg-green-400" : "bg-zinc-200 dark:bg-dark-border"}`} />
							</div>
							{renderPie(data, summary, labelMap)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Dashboard;
