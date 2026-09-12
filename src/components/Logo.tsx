import Link from "next/link";

type LogoProps = {
	/** sm = 36px (app header), lg = 48px (auth screens) */
	size?: "sm" | "lg";
	withWordmark?: boolean;
	href?: string;
	className?: string;
};

// The one brand mark. Every screen renders this instead of hand-rolling a "P" box.
export function Logo({ size = "sm", withWordmark = false, href, className = "" }: LogoProps) {
	const mark = (
		<span
			className={`inline-flex items-center justify-center rounded-xl bg-brand-500 font-black tracking-tight text-white ${
				size === "lg" ? "h-12 w-12 text-xl" : "h-9 w-9 text-base"
			}`}
			aria-hidden="true"
		>
			P
		</span>
	);

	const content = (
		<span className={`inline-flex items-center gap-3 ${className}`}>
			{mark}
			{withWordmark && (
				<span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
					Pennywise
				</span>
			)}
			{!withWordmark && <span className="sr-only">Pennywise</span>}
		</span>
	);

	return href ? (
		// aria-label so the link keeps its name even where the wordmark is CSS-hidden
		<Link href={href} className="rounded-xl" aria-label="Pennywise home">
			{content}
		</Link>
	) : (
		content
	);
}
