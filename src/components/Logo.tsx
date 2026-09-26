import Link from "next/link";

type MarkProps = { className?: string; size?: number };

/** A torn slip with the P printed on it. Paper and ink follow currentColor / the ink token. */
export function Mark({ className = "", size = 30 }: MarkProps) {
	return (
		<svg
			viewBox="0 0 32 36"
			width={size}
			height={(size * 36) / 32}
			className={className}
			aria-hidden="true"
		>
			<path
				d="M4 2h24v28l-2 2.5-2-2.5-2 2.5-2-2.5-2 2.5-2-2.5-2 2.5-2-2.5-2 2.5-2-2.5-2 2.5-2-2.5z"
				fill="currentColor"
			/>
			<path
				d="M11.5 8.5h5.6c3.3 0 5.4 1.9 5.4 4.8s-2.1 4.8-5.4 4.8h-2.3v4.9h-3.3zm3.3 2.8v4h2.1c1.4 0 2.3-.8 2.3-2s-.9-2-2.3-2z"
				className="fill-term"
			/>
			<path d="M8 26.5h16" className="stroke-term" strokeWidth="1.2" strokeDasharray="2 1.6" />
		</svg>
	);
}

type LogoProps = {
	href?: string;
	withWordmark?: boolean;
	className?: string;
	/** "terminal" = on the dark chrome; "paper" = on the light ground. */
	tone?: "terminal" | "paper";
	size?: number;
};

export function Logo({ href, withWordmark = true, className = "", tone = "paper", size = 28 }: LogoProps) {
	const content = (
		<span className={`inline-flex items-center gap-2.5 ${className}`}>
			<Mark
				size={size}
				className={tone === "terminal" ? "text-paper dark:text-ink" : "text-ink [&_.fill-term]:fill-paper [&_.stroke-term]:stroke-paper"}
			/>
			{withWordmark ? (
				<span
					className={`font-mono text-[15px] font-bold uppercase tracking-[0.14em] ${
						tone === "terminal" ? "text-term-ink" : "text-ink"
					}`}
				>
					Pennywise
				</span>
			) : (
				<span className="sr-only">Pennywise</span>
			)}
		</span>
	);

	return href ? (
		<Link href={href} className="rounded-[6px]" aria-label="Pennywise home">
			{content}
		</Link>
	) : (
		content
	);
}
