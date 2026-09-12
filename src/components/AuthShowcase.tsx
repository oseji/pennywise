"use client";

import ChartCategories from "@/app/dashboard/overview/ChartCategories";
import { formatMoney } from "@/utils/formatMoney";

// Sample figures for the auth-screen preview. Built from the real dashboard
// components so the marketing panel and the product never drift apart.
const SAMPLE_INCOME = 2_151_874;
const SAMPLE_SPENT = 1_309_314;
const SAMPLE_CATEGORIES = {
	categories: [
		{ name: "salary", percentage: 63.7, totalAmount: 1_371_578 },
		{ name: "gift", percentage: 34.9, totalAmount: 750_336 },
		{ name: "allowance", percentage: 1.4, totalAmount: 29_938 },
	],
};

export function AuthShowcase() {
	return (
		<aside
			className="hidden lg:flex lg:flex-1 flex-col items-center justify-center gap-10 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 p-12"
			aria-label="Product preview"
		>
			<div className="max-w-md text-center">
				<p className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
					Know where your money goes.
				</p>
				<p className="mt-3 text-base text-brand-100">
					Income, spending and budgets — one honest number at the top, the detail underneath.
				</p>
			</div>

			<div
				className="w-full max-w-sm rounded-2xl border border-white/20 bg-white p-6 shadow-card-md dark:bg-dark-raised"
				aria-hidden="true"
			>
				<p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
					Net balance
				</p>
				<p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
					{formatMoney(SAMPLE_INCOME - SAMPLE_SPENT, "NGN")}
				</p>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
					<span className="tabular-nums">{formatMoney(SAMPLE_INCOME, "NGN")}</span> in ·{" "}
					<span className="tabular-nums">{formatMoney(SAMPLE_SPENT, "NGN")}</span> out
				</p>

				<div className="mt-5 border-t border-zinc-100 pt-4 dark:border-dark-border">
					<p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
						Income by source
					</p>
					<ChartCategories summary={SAMPLE_CATEGORIES} limit={3} />
				</div>
			</div>
		</aside>
	);
}
