import type { ReactNode } from "react";
import { PrintIn } from "@/components/motion/PrintIn";

type Props = {
	title: ReactNode;
	id: string;
	aside?: ReactNode;
	children: ReactNode;
	className?: string;
	bodyClassName?: string;
	/** Print-in timing; omit `play` to render static. */
	play?: boolean;
	delay?: number;
	lines?: number;
};

/** A section printed on its own slip: mono heading, dashed tear rule, body. */
export function Slip({ title, id, aside, children, className = "", bodyClassName = "", play = false, delay = 0, lines = 14 }: Props) {
	return (
		<PrintIn as="section" aria-labelledby={id} play={play} delay={delay} lines={lines} className={`slip flex min-w-0 flex-col ${className}`}>
			<div className="flex min-h-[52px] items-center justify-between gap-3 px-4 pt-2 md:px-5">
				<h2 id={id} className="font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
					{title}
				</h2>
				{aside}
			</div>
			<div className="rule-dash mx-4 md:mx-5" aria-hidden />
			<div className={`flex-1 px-4 pb-4 pt-3 md:px-5 md:pb-5 ${bodyClassName}`}>{children}</div>
		</PrintIn>
	);
}
