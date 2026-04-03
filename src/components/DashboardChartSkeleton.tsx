export function DashboardChartSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="flex h-96 flex-col items-center rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:h-[450px]"
				>
					<div className="mb-5 flex w-full flex-row items-center justify-between">
						<div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
						<div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
					</div>
					<div className="my-4 h-[200px] w-[200px] animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
					<div className="mt-auto w-full space-y-2">
						<div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
						<div className="h-3 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
					</div>
				</div>
			))}
		</div>
	);
}
