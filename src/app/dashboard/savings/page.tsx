import Link from "next/link";
import { PiggyBank } from "lucide-react";

export const metadata = {
	title: "Pennywise | Savings",
};

// Savings isn't built yet. This page exists so the URL doesn't 404 and so the
// "coming soon" promise in the sidebar lands somewhere honest.
const SavingsPage = () => {
	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">Savings</h1>

			<div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-600/10 dark:text-green-400">
					<PiggyBank className="h-7 w-7" aria-hidden />
				</div>
				<div>
					<h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
						Savings targets are coming soon
					</h2>
					<p className="mx-auto mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
						You&apos;ll be able to set a goal, a cadence, and watch progress against it.
						In the meantime, budgets are the best way to put money aside.
					</p>
				</div>
				<Link href="/dashboard/budget" className="btn-outline-brand">
					Go to Budget
				</Link>
			</div>
		</div>
	);
};

export default SavingsPage;
