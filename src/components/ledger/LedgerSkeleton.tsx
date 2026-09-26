export function LedgerSkeleton({ rows = 6 }: { rows?: number }) {
	return (
		<div className="slip px-4 py-5 md:px-5" aria-busy="true" aria-label="Loading entries">
			<div className="skeleton h-3 w-28" />
			<ul className="mt-5 flex flex-col gap-4">
				{Array.from({ length: rows }, (_, i) => (
					<li key={i} className="flex items-center gap-4">
						<div className="skeleton h-3 w-14" />
						<div className="skeleton h-3 flex-1" />
						<div className="skeleton h-3 w-20" />
					</li>
				))}
			</ul>
		</div>
	);
}
