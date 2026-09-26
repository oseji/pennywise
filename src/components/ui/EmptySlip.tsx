import type { ReactNode } from "react";

type Ghost = { label: string; value?: string };

type Props = {
	title: string;
	children: ReactNode;
	/** The shape of what will print here, drawn faintly. */
	ghosts?: Ghost[];
	actions?: ReactNode;
	compact?: boolean;
	className?: string;
};

/**
 * An empty state set as a slip waiting for its first line: faint lines show
 * what will print, a cursor blinks at the end, and the copy says what to do.
 */
export function EmptySlip({ title, children, ghosts = [], actions, compact = false, className = "" }: Props) {
	return (
		<div className={`flex flex-col ${compact ? "gap-3 py-2" : "gap-4 py-4"} ${className}`}>
			{ghosts.length > 0 && (
				<ul aria-hidden className="flex flex-col gap-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3/80">
					{ghosts.map((g, i) => (
						<li key={g.label} className="flex items-end">
							<span>{g.label}</span>
							<span className="leader opacity-70" />
							<span className="tabular-nums">
								{g.value ?? "— —"}
								{i === ghosts.length - 1 && (
									<span className="ml-1 inline-block h-[1.05em] w-[0.55em] translate-y-[2px] bg-ink-3/70 motion-safe:animate-[blink_1.1s_steps(1)_infinite]" />
								)}
							</span>
						</li>
					))}
				</ul>
			)}
			<div>
				<h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink">{title}</h3>
				<div className="mt-1.5 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{children}</div>
			</div>
			{actions && <div className="flex flex-wrap gap-2">{actions}</div>}
		</div>
	);
}
