"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/components/motion/easing";
import { steps } from "motion";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
	children: ReactNode;
	/** Seconds. */
	delay?: number;
	/** Roughly how many printed lines tall; sets the number of feed steps. */
	lines?: number;
	className?: string;
	id?: string;
	as?: "div" | "section" | "article" | "li";
	/** false renders the final state without animating (already printed this session). */
	play?: boolean;
	"aria-labelledby"?: string;
};

/**
 * A slip printing out: revealed top-down in discrete line feeds (a thermal
 * head advances a line at a time), while the paper settles a few pixels.
 * Reduced motion: a plain fade.
 */
export function PrintIn({ children, delay = 0, lines = 14, className = "", as = "div", play = true, ...rest }: Props) {
	const reduced = useReducedMotion();
	const ref = useRef<HTMLElement>(null);
	const Tag = motion[as] as typeof motion.div;
	const n = Math.min(28, Math.max(6, Math.round(lines)));

	// Content must never stay hidden: if animation frames don't run (background
	// tab, capture tools), a timer finishes the reveal.
	useEffect(() => {
		if (!play || reduced) return;
		const t = setTimeout(() => {
			const el = ref.current;
			if (!el) return;
			el.style.clipPath = "none";
			el.style.transform = "none";
		}, (delay + n * 0.028 + 0.6) * 1000);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount
	}, []);

	if (!play) {
		const Static = as;
		return (
			<Static className={className} {...rest}>
				{children}
			</Static>
		);
	}

	if (reduced) {
		return (
			<Tag
				className={className}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.25, delay: delay * 0.4 }}
				{...rest}
			>
				{children}
			</Tag>
		);
	}

	return (
		<Tag
			className={className}
			initial={{ clipPath: "inset(0% 0% 100% 0%)", y: -6 }}
			animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
			transition={{
				clipPath: { duration: n * 0.028, delay, ease: steps(n, "end") },
				y: { duration: n * 0.028 + 0.2, delay, ease: EASE_OUT },
			}}
			ref={ref as React.Ref<HTMLDivElement>}
			// once printed, drop the clip so focus rings and tooltips aren't cut off
			onAnimationComplete={() => {
				if (ref.current) ref.current.style.clipPath = "none";
			}}
			{...rest}
		>
			{children}
		</Tag>
	);
}
