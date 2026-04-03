type EmptyStateProps = {
	title: string;
	description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-500 dark:text-slate-400">
			<p className="font-semibold text-slate-700 dark:text-slate-300">{title}</p>
			{description ? <p className="max-w-xs text-sm">{description}</p> : null}
		</div>
	);
}
