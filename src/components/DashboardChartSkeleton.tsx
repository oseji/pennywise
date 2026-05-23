export function DashboardChartSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="flex h-96 flex-col items-center rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-card
					           dark:border-dark-border dark:bg-dark-raised dark:shadow-dark-card md:h-[500px]"
				>
					<div className="mb-5 flex w-full flex-row items-center justify-between">
						<div className="h-5 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-dark-overlay" />
						<div className="h-5 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-dark-overlay" />
					</div>
					<div className="my-6 h-[180px] w-[180px] animate-pulse rounded-full bg-zinc-100 dark:bg-dark-overlay" />
					<div className="mt-auto w-full space-y-2.5">
						<div className="h-3 w-full animate-pulse rounded-full bg-zinc-100 dark:bg-dark-overlay" />
						<div className="h-3 w-4/5 animate-pulse rounded-full bg-zinc-100 dark:bg-dark-overlay" />
						<div className="h-3 w-3/5 animate-pulse rounded-full bg-zinc-100 dark:bg-dark-overlay" />
					</div>
				</div>
			))}
		</div>
	);
}
