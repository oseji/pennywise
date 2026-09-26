import type { ReactNode } from "react";

type Props = { title: string; children?: ReactNode; actions?: ReactNode };

/** Page title set like a slip header, with an optional summary line and actions. */
export function PageHeader({ title, children, actions }: Props) {
	return (
		<header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
			<div className="min-w-0">
				<h1 className="page-title">{title}</h1>
				{children && <div className="mt-2.5 text-[15px] text-ink-2">{children}</div>}
			</div>
			{actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
		</header>
	);
}
