"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { db } from "@/firebase/firebase";
import { getDocs, collection, orderBy, query } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";

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

const EMPTY: userData = { total: 0, categories: [] };

const Dashboard = () => {
	const { user, initialized: authInitialized } = useAuthStore();
	const currency = usePreferencesStore((s) => s.currency);

	const [isLoading, setisLoading] = useState<boolean>(true);

	const [incomeSummary, setIncomeSummary] = useState<userData>(EMPTY);
	const [expenseSummary, setExpenseSummary] = useState<userData>(EMPTY);
	const [budgetSummary, setBudgetSummary] = useState<userData>(EMPTY);

	const fetchUserDataSummary = async (
		userId: string
	): Promise<{
		income: userData;
		expense: userData;
	}> => {
		setisLoading(true);

		if (!userId) {
			return { income: EMPTY, expense: EMPTY };
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
			return { income: EMPTY, expense: EMPTY };
		} finally {
			setisLoading(false);
		}
	};

	const fetchBudgetData = async (userId: string): Promise<userData> => {
		if (!userId) return EMPTY;

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
			return EMPTY;
		}
	};

	useEffect(() => {
		const load = async () => {
			if (!authInitialized) return;
			if (!user?.uid) {
				setisLoading(false);
				return;
			}

			const data = await fetchUserDataSummary(user.uid);
			const budget = await fetchBudgetData(user.uid);

			if (data && budget) {
				setIncomeSummary(data.income);
				setExpenseSummary(data.expense);
				setBudgetSummary(budget);
			}
		};
		load();
	}, [user?.uid, authInitialized]);

	const net = incomeSummary.total - expenseSummary.total;
	const hasBudget = budgetSummary.total > 0;
	const budgetUsed = hasBudget
		? Math.min((expenseSummary.total / budgetSummary.total) * 100, 100)
		: 0;
	const budgetRemaining = budgetSummary.total - expenseSummary.total;
	const overBudget = hasBudget && budgetRemaining < 0;

	const cards = [
		{
			title: "Income",
			summary: incomeSummary,
			labelMap: undefined,
			empty: { title: "No income yet", description: "Add entries on the Income page to see the breakdown here.", href: "/dashboard/income", cta: "Add income" },
		},
		{
			title: "Expenditure",
			summary: expenseSummary,
			labelMap: undefined,
			empty: { title: "No spending yet", description: "Log expenses to see where the money went.", href: "/dashboard/expenses", cta: "Add expense" },
		},
		{
			title: "Budget",
			summary: budgetSummary,
			labelMap: BUDGET_LABEL_MAP,
			empty: { title: "No budget set", description: "Set limits per category to track spending against them.", href: "/dashboard/budget", cta: "Set a budget" },
		},
	];

	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">Dashboard</h1>

			{isLoading ? (
				<DashboardChartSkeleton />
			) : (
				<div className="flex flex-col gap-5">
					{/* The one number that matters, first. */}
					<section
						aria-labelledby="net-balance-heading"
						className="card flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8"
					>
						<div>
							<h2
								id="net-balance-heading"
								className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
							>
								Net balance
							</h2>
							<p
								className={`mt-1 text-4xl font-bold tabular-nums tracking-tight md:text-5xl ${
									net < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
								}`}
							>
								{formatMoney(net, currency)}
							</p>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								<span className="tabular-nums">{formatMoney(incomeSummary.total, currency)}</span> in
								{" · "}
								<span className="tabular-nums">{formatMoney(expenseSummary.total, currency)}</span> out
							</p>
						</div>

						<div className="w-full md:w-72">
							<div className="flex items-baseline justify-between gap-3 text-sm">
								<span className="font-semibold text-zinc-700 dark:text-zinc-300">
									{hasBudget ? (overBudget ? "Over budget" : "Budget remaining") : "Budget"}
								</span>
								{hasBudget ? (
									<span
										className={`font-semibold tabular-nums ${
											overBudget ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
										}`}
									>
										{formatMoney(Math.abs(budgetRemaining), currency)}
									</span>
								) : (
									<Link
										href="/dashboard/budget"
										className="font-semibold text-brand-500 hover:text-brand-600 dark:text-green-400"
									>
										Set a budget
									</Link>
								)}
							</div>
							{hasBudget && (
								<>
									<div
										className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-dark-border"
										role="progressbar"
										aria-label="Budget used"
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={Math.round(budgetUsed)}
									>
										<div
											className={`h-full rounded-full ${overBudget ? "bg-red-600" : "bg-brand-500 dark:bg-green-400"}`}
											style={{ width: `${budgetUsed}%` }}
										/>
									</div>
									<p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
										<span className="tabular-nums">{formatMoney(expenseSummary.total, currency)}</span> of{" "}
										<span className="tabular-nums">{formatMoney(budgetSummary.total, currency)}</span> used
									</p>
								</>
							)}
						</div>
					</section>

					<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
						{cards.map(({ title, summary, labelMap, empty }) => (
							<section key={title} className="chartBox" aria-labelledby={`card-${title}`}>
								<div className="chartBoxHeadingGroup">
									<div>
										<h2
											id={`card-${title}`}
											className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
										>
											{title}
										</h2>
										<p className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
											{formatMoney(summary.total, currency)}
										</p>
									</div>
								</div>

								{summary.total === 0 || summary.categories.length === 0 ? (
									<div className="flex w-full flex-col items-center">
										<EmptyState title={empty.title} description={empty.description} />
										<Link href={empty.href} className="btn-outline-brand -mt-4">
											{empty.cta}
										</Link>
									</div>
								) : (
									<ChartCategories summary={summary} limit={5} labelMap={labelMap} />
								)}
							</section>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
