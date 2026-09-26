"use client";

import { useEffect, useMemo, useRef } from "react";
import { EASE_OUT } from "@/components/motion/easing";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { currencyParts, formatCurrency } from "@/utils/formatMoney";
import type { CurrencyCode } from "@/store/usePreferencesStore";

const CELL = 1.12; // em; digit cell height == line-height
const DIGITS = Array.from({ length: 30 }, (_, i) => i % 10);


type Props = {
	value: number;
	currency: CurrencyCode;
	/** Seconds before the first roll (entrance choreography). */
	delay?: number;
	className?: string;
};

/**
 * The register's total drum: each digit sits on a wheel. On change the wheels
 * roll and lock from the most significant digit to the least, so the cents
 * are the last thing to settle. Reduced motion: the figure crossfades.
 */
export function Drum({ value, currency, delay = 0, className = "" }: Props) {
	const reduced = useReducedMotion();
	const label = formatCurrency(value, currency);
	const prev = useRef<number | null>(null);
	const direction = prev.current === null || value >= prev.current ? 1 : -1;
	useEffect(() => {
		prev.current = value;
	}, [value]);

	const cols = useMemo(() => {
		type Char = { kind: "digit" | "static"; char: string };
		const chars: Char[] = currencyParts(value, currency).flatMap((p): Char[] =>
			p.type === "integer" || p.type === "fraction"
				? p.value.split("").map((c) => ({ kind: "digit", char: c }))
				: [{ kind: "static", char: p.value }]
		);
		const digitCount = chars.filter((c) => c.kind === "digit").length;
		let d = 0;
		// keys count from the right so existing wheels persist when a digit is added on the left
		return chars.map((c, i) => {
			const fromRight = chars.length - i;
			if (c.kind === "digit") {
				const order = d++;
				return { ...c, key: `d${fromRight}`, order, count: digitCount };
			}
			return { ...c, key: `s${fromRight}-${c.char}`, order: -1, count: digitCount };
		});
	}, [value, currency]);

	if (reduced) {
		return (
			<span className={`relative inline-grid ${className}`}>
				<AnimatePresence initial={false} mode="popLayout">
					<motion.span
						key={label}
						className="col-start-1 row-start-1 whitespace-nowrap"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{label}
					</motion.span>
				</AnimatePresence>
			</span>
		);
	}

	return (
		<span className={`inline-flex whitespace-nowrap ${className}`}>
			<span className="sr-only">{label}</span>
			<span aria-hidden className="inline-flex" style={{ lineHeight: `${CELL}em`, height: `${CELL}em` }}>
				{cols.map((c) =>
					c.kind === "digit" ? (
						<Wheel key={c.key} digit={Number(c.char)} order={c.order} count={c.count} delay={delay} direction={direction} />
					) : (
						<span key={c.key}>{c.char}</span>
					)
				)}
			</span>
		</span>
	);
}

function Wheel({
	digit,
	order,
	count,
	delay,
	direction,
}: {
	digit: number;
	order: number;
	count: number;
	delay: number;
	direction: number;
}) {
	const pos = useMotionValue(0);
	const y = useTransform(pos, (p) => `${-p * CELL}em`);
	const shown = useRef(0);

	useEffect(() => {
		const from = shown.current;
		if (from === digit && pos.get() === digit) return;
		// lower-order wheels travel further, so they visibly count
		const spins = order === 0 ? 0 : order >= count - 2 ? 2 : 1;
		const up = direction > 0;
		const start = up ? from : spins * 10 + from;
		const end = up ? spins * 10 + digit : digit;
		pos.set(start);
		const controls = animate(pos, end, {
			duration: 0.55 + order * 0.09,
			delay,
			ease: EASE_OUT,
			onComplete: () => pos.set(digit),
		});
		shown.current = digit;
		return () => controls.stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- roll only when the digit changes
	}, [digit]);

	return (
		<span className="relative inline-block overflow-hidden" style={{ height: `${CELL}em` }}>
			<span className="invisible">0</span>
			<motion.span className="absolute inset-x-0 top-0 flex flex-col items-center" style={{ y }}>
				{DIGITS.map((n, i) => (
					<span key={i} style={{ height: `${CELL}em` }}>
						{n}
					</span>
				))}
			</motion.span>
		</span>
	);
}
