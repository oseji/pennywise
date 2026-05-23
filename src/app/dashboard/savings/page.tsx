"use client";
import { useState } from "react";
import { AccessibleDialog } from "@/components/AccessibleDialog";
import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";

const SavingsPage = () => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const currency = usePreferencesStore((s) => s.currency);

	const demoAmount = 100_000;

	return (
		<div className="relative dashboardScreen">
			<div>
				<h1 className="dashboardHeading">savings</h1>

				<div className="flex flex-row items-center justify-between capitalize">
					<h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
						Savings target
					</h2>

					<button
						type="button"
						className="rounded-lg bg-brand-500 px-4 py-2 font-semibold capitalize text-white transition hover:opacity-95"
						onClick={() => setIsModalOpen(true)}
					>
						new target
					</button>
				</div>

				<p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
					Savings targets will sync to your account in a future update. Below is
					a sample layout.
				</p>

				{/* Mobile card */}
				<div className="mt-6 md:hidden">
					<div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-raised">
						<p className="text-xs font-semibold uppercase tracking-wide text-brand-500 dark:text-green-400">
							Sample
						</p>
						<p className="mt-1 capitalize text-slate-900 dark:text-zinc-100">
							emergency
						</p>
						<p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
							Monthly · Target {formatMoney(demoAmount, currency)}
						</p>
						<p className="mt-1 text-xs text-slate-500">Dec 2023</p>
						<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-dark-overlay">
							<div className="h-full w-[45%] rounded-full bg-brand-500" />
						</div>
					</div>
				</div>

				{/* Desktop table */}
				<div className="mt-6 hidden text-sm md:block">
					<div className="overflow-x-auto rounded-t-xl">
						<div className="dataTableHeader grid min-w-[820px] grid-cols-5">
							<p className="tableStickyCell">purpose</p>
							<p>frequency</p>
							<p>amount</p>
							<p>target date</p>
							<p>progress</p>
						</div>
					</div>
					<div className="dataTableSurface min-w-[820px] px-4 pb-6 pt-5">
						<div className="grid grid-cols-5 gap-2 border-b border-zinc-100 py-3 dark:border-dark-border">
							<p className="tableStickyCell text-slate-900 dark:text-zinc-100">
								<span className="mr-1">1.</span>
								<span className="capitalize">emergency</span>
							</p>
							<p className="capitalize text-slate-700 dark:text-zinc-300">
								monthly
							</p>
							<p className="tabular-nums text-slate-900 dark:text-zinc-100">
								{formatMoney(demoAmount, currency)}
							</p>
							<p className="text-slate-600 dark:text-zinc-400">Dec, 2023</p>
							<p className="truncate text-slate-600 dark:text-zinc-400">
								45% toward goal
							</p>
						</div>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
					<div className="flex flex-row items-end gap-3">
						<div className="h-5 w-5 shrink-0 rounded bg-green-500" />
						<p className="text-slate-700 dark:text-zinc-300">Savings on track</p>
					</div>

					<div className="flex flex-row items-end gap-3">
						<div className="h-5 w-5 shrink-0 rounded bg-yellow-500" />
						<p className="text-slate-700 dark:text-zinc-300">1 payment behind</p>
					</div>

					<div className="flex flex-row items-end gap-3">
						<div className="h-5 w-5 shrink-0 rounded bg-red-500" />
						<p className="text-slate-700 dark:text-zinc-300">
							Multiple payments behind
						</p>
					</div>
				</div>
			</div>

			<AccessibleDialog
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Add savings target"
				titleId="savings-dialog-title"
			>
				<form
					className="flex flex-col gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						setIsModalOpen(false);
					}}
				>
					<div className="inputLabelGroup">
						<label htmlFor="savings-purpose" className="inputLabel">
							Savings purpose
						</label>
						<input
							className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
							type="text"
							name="narration"
							id="savings-purpose"
							placeholder="e.g. Emergency fund"
						/>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="frequency" className="inputLabel">
							Frequency
						</label>
						<select
							name="frequency"
							id="frequency"
							className="rounded-lg border border-zinc-200 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
							defaultValue=""
						>
							<option value="" disabled>
								Select frequency
							</option>
							<option value="Daily">Daily</option>
							<option value="Monthly">Monthly</option>
							<option value="Yearly">Yearly</option>
						</select>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="target-amount" className="inputLabel">
							Target amount
						</label>
						<input
							className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
							type="number"
							name="amount"
							id="target-amount"
							placeholder="Enter target amount"
						/>
					</div>

					<div className="inputLabelGroup">
						<label htmlFor="target-date" className="inputLabel">
							Target date
						</label>
						<input
							className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 dark:border-dark-border dark:bg-dark-base dark:text-zinc-100"
							type="date"
							name="date"
							id="target-date"
						/>
					</div>

					<button
						type="submit"
						className="mt-4 w-full rounded-lg bg-brand-500 py-2 font-semibold text-white transition hover:opacity-95"
					>
						Add
					</button>
				</form>
			</AccessibleDialog>
		</div>
	);
};

export default SavingsPage;
