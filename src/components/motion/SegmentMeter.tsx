"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type Props = {
	spent: number;
	limit: number;
	segments?: number;
	className?: string;
	/** Seconds before the first segment prints. */
	delay?: number;
};

export type MeterTone = "ok" | "warn" | "over" | "none";

export const meterTone = (spent: number, limit: number): MeterTone => {
	if (limit <= 0) return "none";
	const r = spent / limit;
	if (r > 1) return "over";
	if (r >= 0.75) return "warn";
	return "ok";
};

const FILL: Record<MeterTone, string> = {
	ok: "bg-ink",
	warn: "bg-warn-fill",
	over: "bg-neg",
	none: "bg-ink",
};

/**
 * Spend against a limit, printed as discrete segments. Past the limit the
 * scale extends to the spend: segments inside the limit stay tinted, the
 * overflow prints solid red, and a tick marks where the limit was.
 * Segments print one at a time when the meter enters view; reduced motion
 * shows the final state.
 */
export function SegmentMeter({ spent, limit, segments = 30, className = "", delay = 0 }: Props) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
	const reduced = useReducedMotion();
	const tone = meterTone(spent, limit);
	const over = tone === "over";

	const target = limit <= 0 ? 0 : over ? segments : Math.min(segments, spent > 0 ? Math.max(1, Math.round((spent / limit) * segments)) : 0);
	const limitAt = over ? Math.max(1, Math.round((limit / spent) * segments)) : segments;

	const [filled, setFilled] = useState(0);
	const from = useRef(0);
	useEffect(() => {
		if (!inView && !reduced) return;
		from.current = filled;
		setFilled(target);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the target or visibility changes
	}, [target, inView, reduced]);

	const step = 0.016;
	return (
		<div ref={ref} className={`relative flex h-2.5 items-stretch gap-[2px] ${className}`} aria-hidden>
			{Array.from({ length: segments }, (_, i) => {
				const on = i < filled;
				const growing = filled > from.current;
				const offset = growing ? i - from.current : from.current - 1 - i;
				const tint = over && i < limitAt ? "bg-neg/45" : FILL[tone];
				return (
					<span
						key={i}
						className={`flex-1 rounded-[1px] ${on ? tint : "bg-paper-3"}`}
						style={
							reduced
								? undefined
								: {
										transition: "background-color 0s",
										transitionDelay: `${delay + Math.max(0, offset) * step}s`,
									}
						}
					/>
				);
			})}
			{over && (
				<span
					className="absolute -bottom-1 -top-1 w-[2px] rounded-full bg-ink"
					style={{ left: `calc(${(limitAt / segments) * 100}% - 1px)` }}
				/>
			)}
		</div>
	);
}
