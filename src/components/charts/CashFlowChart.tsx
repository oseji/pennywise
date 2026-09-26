"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { EASE_OUT } from "@/components/motion/easing";
import { useMeasure } from "@/components/ui/useMeasure";
import { formatCurrency } from "@/utils/formatMoney";
import type { MonthFlow } from "@/lib/finance/derive";
import type { CurrencyCode } from "@/store/usePreferencesStore";

type Props = {
	data: MonthFlow[];
	currency: CurrencyCode;
	view: "chart" | "table";
	/** Seconds before the columns start growing. */
	delay?: number;
	play?: boolean;
};

const H = 216;
const PAD_TOP = 14;
const AXIS_BAND = 26; // month labels under the plot
const LEFT = 52; // y tick labels
const BAR_MAX = 24;
const R = 4;

/** Round a max up to a clean tick (1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8 × 10^n). */
function niceCeil(v: number) {
	if (v <= 0) return 1;
	const p = 10 ** Math.floor(Math.log10(v));
	const n = v / p;
	const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => n <= x) ?? 10;
	return step * p;
}

/** Column with a rounded data end and a square foot on the baseline; height animates from 0. */
function Column({
	x,
	w,
	base,
	height,
	dir,
	fill,
	delay,
	play,
}: {
	x: number;
	w: number;
	base: number;
	height: number;
	dir: 1 | -1;
	fill: string;
	delay: number;
	play: boolean;
}) {
	const reduced = useReducedMotion();
	const h = useMotionValue(play && !reduced ? 0 : height);
	useEffect(() => {
		const c = animate(h, height, reduced ? { duration: 0 } : { duration: 0.7, delay, ease: EASE_OUT });
		return () => c.stop();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- animate on height change
	}, [height]);

	const d = useTransform(h, (v) => {
		if (v < 0.5) return "";
		const r = Math.min(R, v, w / 2);
		if (dir === 1) {
			const top = base - v;
			return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`;
		}
		const bottom = base + v;
		return `M${x},${base}V${bottom - r}Q${x},${bottom} ${x + r},${bottom}H${x + w - r}Q${x + w},${bottom} ${x + w},${bottom - r}V${base}Z`;
	});

	return <motion.path d={d} fill={fill} />;
}

/**
 * Money in above the baseline, money out below it, on one shared scale —
 * a diverging column per month, with net marked as a dot.
 */
export function CashFlowChart({ data, currency, view, delay = 0, play = true }: Props) {
	const [ref, width] = useMeasure<HTMLDivElement>();
	const [hover, setHover] = useState<number | null>(null);
	const reduced = useReducedMotion();
	const uid = useId();

	const geo = useMemo(() => {
		const maxIn = niceCeil(Math.max(0, ...data.map((d) => d.income)));
		const maxOut = niceCeil(Math.max(0, ...data.map((d) => d.spent)));
		const scaleMax = Math.max(maxIn, maxOut);
		const plotH = H - PAD_TOP - AXIS_BAND;
		// both halves share one scale; the baseline sits where the larger side needs it
		const upShare = maxIn / (maxIn + maxOut || 1);
		const base = PAD_TOP + plotH * upShare;
		const px = plotH / (maxIn + maxOut || 1);
		const plotW = Math.max(0, width - LEFT);
		const band = plotW / data.length;
		const barW = Math.min(BAR_MAX, band * 0.46);
		return { maxIn, maxOut, scaleMax, base, px, band, barW, plotH };
	}, [data, width]);

	const fmt = (v: number) => formatCurrency(v, currency);
	const compact = (v: number) => formatCurrency(v, currency, { compact: true });

	if (view === "table") {
		return (
			<div className="overflow-x-auto">
				<table className="w-full min-w-[420px] text-[14px]">
					<caption className="sr-only">Income, spending and net by month</caption>
					<thead>
						<tr className="label text-left">
							<th scope="col" className="py-2 font-semibold">Month</th>
							<th scope="col" className="py-2 text-right font-semibold">In</th>
							<th scope="col" className="py-2 text-right font-semibold">Out</th>
							<th scope="col" className="py-2 text-right font-semibold">Net</th>
						</tr>
					</thead>
					<tbody className="num">
						{data.map((m) => (
							<tr key={m.key} className="border-t border-dashed border-rule">
								<th scope="row" className="py-2 text-left font-mono font-semibold uppercase">
									{m.label} {m.year}
								</th>
								<td className="py-2 text-right">{fmt(m.income)}</td>
								<td className="py-2 text-right">{fmt(m.spent)}</td>
								<td className={`py-2 text-right ${m.net < 0 ? "text-neg" : ""}`}>
									{formatCurrency(m.net, currency, { signed: true })}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	const { base, px, band, barW, maxIn, maxOut } = geo;
	const hovered = hover !== null ? data[hover] : null;

	return (
		<div ref={ref} className="relative select-none" onPointerLeave={() => setHover(null)}>
			{width > 0 && (
				<svg width={width} height={H} role="img" aria-labelledby={`${uid}-desc`} className="block overflow-visible">
					<desc id={`${uid}-desc`}>
						Cash flow for the last {data.length} months. Use the table view for exact figures.
					</desc>

					{/* grid: baseline plus the two clean extremes */}
					{[
						{ y: base, v: 0, strong: true },
						{ y: base - maxIn * px, v: maxIn, strong: false },
						{ y: base + maxOut * px, v: -maxOut, strong: false },
					]
						.filter((t, i) => i === 0 || Math.abs(t.v) > 0)
						.map((t) => (
							<g key={t.v}>
								<line
									x1={LEFT}
									x2={width}
									y1={t.y}
									y2={t.y}
									className={t.strong ? "stroke-rule-2" : "stroke-rule"}
									strokeWidth={1}
									shapeRendering="crispEdges"
								/>
								<text
									x={LEFT - 8}
									y={t.y}
									dy="0.32em"
									textAnchor="end"
									className="fill-ink-3 font-mono text-[10.5px] tabular-nums"
								>
									{t.v === 0 ? "0" : `${t.v < 0 ? "−" : ""}${compact(Math.abs(t.v))}`}
								</text>
							</g>
						))}

					{data.map((m, i) => {
						const cx = LEFT + band * i + band / 2;
						const x = cx - barW / 2;
						const netY = base - m.net * px;
						const active = hover === i;
						return (
							<g key={m.key}>
								{active && (
									<rect
										x={LEFT + band * i + 2}
										y={PAD_TOP - 6}
										width={band - 4}
										height={H - PAD_TOP - AXIS_BAND + 12}
										rx={4}
										className="fill-paper-2"
									/>
								)}
								<Column x={x} w={barW} base={base} height={m.income * px} dir={1} fill="rgb(var(--chart-in))" delay={delay + i * 0.07} play={play} />
								<Column x={x} w={barW} base={base} height={m.spent * px} dir={-1} fill="rgb(var(--chart-out))" delay={delay + 0.12 + i * 0.07} play={play} />
								{(m.income > 0 || m.spent > 0) && (
									<motion.circle
										cx={cx}
										cy={netY}
										r={4.5}
										className="fill-ink stroke-paper"
										strokeWidth={2}
										initial={play && !reduced ? { opacity: 0, scale: 0 } : false}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: play ? delay + 0.55 + i * 0.07 : 0, duration: 0.3, ease: EASE_OUT }}
									/>
								)}
								<text
									x={cx}
									y={H - 8}
									textAnchor="middle"
									className={`font-mono text-[11px] font-semibold uppercase ${active ? "fill-ink" : "fill-ink-3"}`}
								>
									{m.label}
								</text>
								{/* hit band: bigger than the marks, keyboard-focusable */}
								<rect
									x={LEFT + band * i}
									y={0}
									width={band}
									height={H}
									fill="transparent"
									tabIndex={0}
									role="img"
									aria-label={`${m.label} ${m.year}: in ${fmt(m.income)}, out ${fmt(m.spent)}, net ${formatCurrency(m.net, currency, { signed: true })}`}
									onPointerEnter={() => setHover(i)}
									onPointerMove={() => setHover(i)}
									onFocus={() => setHover(i)}
									onBlur={() => setHover(null)}
									className="cursor-default outline-none focus-visible:stroke-[rgb(var(--focus))] focus-visible:stroke-2"
								/>
							</g>
						);
					})}
				</svg>
			)}
			{width === 0 && <div style={{ height: H }} />}

			{hovered && hover !== null && (
				<div
					role="presentation"
					className="pointer-events-none absolute top-1 z-10 w-[190px] rounded-[4px] bg-paper px-3 py-2.5 text-[13px] shadow-lift ring-1 ring-rule"
					style={{
						left: Math.min(Math.max(LEFT + band * hover + band / 2 - 95, 0), Math.max(0, width - 190)),
					}}
				>
					<p className="label mb-1.5">
						{hovered.label} {hovered.year}
					</p>
					{[
						{ k: "In", v: hovered.income, c: "rgb(var(--chart-in))" },
						{ k: "Out", v: hovered.spent, c: "rgb(var(--chart-out))" },
					].map((r) => (
						<p key={r.k} className="flex items-center gap-2">
							<span className="h-[2px] w-3" style={{ background: r.c }} aria-hidden />
							<span className="font-mono font-semibold tabular-nums text-ink">{fmt(r.v)}</span>
							<span className="ml-auto text-ink-3">{r.k}</span>
						</p>
					))}
					<p className="mt-1 flex items-center gap-2 border-t border-dashed border-rule pt-1">
						<span className="h-2 w-2 rounded-full bg-ink" aria-hidden />
						<span className={`font-mono font-semibold tabular-nums ${hovered.net < 0 ? "text-neg" : "text-ink"}`}>
							{formatCurrency(hovered.net, currency, { signed: true })}
						</span>
						<span className="ml-auto text-ink-3">Net</span>
					</p>
				</div>
			)}

			<ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2" aria-label="Legend">
				<li className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-[2px] bg-chart-in" aria-hidden /> Money in
				</li>
				<li className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-[2px] bg-chart-out" aria-hidden /> Money out
				</li>
				<li className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-ink" aria-hidden /> Net
				</li>
			</ul>
		</div>
	);
}
