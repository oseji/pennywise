import { Inbox } from "lucide-react";

type EmptyStateProps = {
	title: string;
	description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-dark-overlay">
				<Inbox className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
			</div>
			<div>
				<p className="font-semibold text-zinc-700 dark:text-zinc-300">{title}</p>
				{description ? (
					<p className="mt-1 max-w-xs text-sm text-zinc-400 dark:text-zinc-500">{description}</p>
				) : null}
			</div>
		</div>
	);
}
