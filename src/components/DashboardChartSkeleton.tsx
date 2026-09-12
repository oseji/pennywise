export function DashboardChartSkeleton() {
	const bar = "animate-pulse rounded-full bg-zinc-100 dark:bg-dark-overlay";
	const block = "animate-pulse rounded-xl bg-zinc-200 dark:bg-dark-overlay";

	return (
		<div className="flex flex-col gap-5">
			{/* Headline */}
			<div className="card p-6 md:p-8">
				<div className={`h-3 w-24 ${block}`} />
				<div className={`mt-3 h-10 w-64 ${block}`} />
				<div className={`mt-3 h-3 w-80 ${bar}`} />
			</div>

			{/* Category cards */}
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{[0, 1, 2].map((i) => (
					<div key={i} className="chartBox">
						<div className="mb-5 flex w-full flex-row items-center justify-between">
							<div className={`h-3 w-20 ${block}`} />
						</div>
						<div className={`mb-5 h-7 w-40 self-start ${block}`} />
						<div className="w-full space-y-4">
							{[0, 1, 2, 3].map((r) => (
								<div key={r} className="space-y-2">
									<div className="flex justify-between">
										<div className={`h-3 w-24 ${bar}`} />
										<div className={`h-3 w-20 ${bar}`} />
									</div>
									<div className={`h-1.5 w-full ${bar}`} />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
