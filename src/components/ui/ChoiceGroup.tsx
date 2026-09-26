"use client";

import type { ReactNode } from "react";

export type Choice<T extends string> = { value: T; label: ReactNode; swatch?: string; hint?: string };

type Props<T extends string> = {
	name: string;
	legend: string;
	options: Choice<T>[];
	value: T | "";
	onChange: (v: T) => void;
	/** "segmented" fills the row with equal keys; "chips" wraps. */
	variant?: "segmented" | "chips";
	hideLegend?: boolean;
	className?: string;
};

/**
 * Native radios drawn as latching keys: the chosen key stays pressed down
 * (edge gone, inverted). Arrow keys move between options as usual.
 */
export function ChoiceGroup<T extends string>({
	name,
	legend,
	options,
	value,
	onChange,
	variant = "chips",
	hideLegend = false,
	className = "",
}: Props<T>) {
	return (
		<fieldset className={className}>
			<legend className={hideLegend ? "sr-only" : "field-label"}>{legend}</legend>
			<div
				className={
					variant === "segmented"
						? "grid gap-2"
						: "flex flex-wrap gap-2"
				}
				style={variant === "segmented" ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` } : undefined}
			>
				{options.map((o) => {
					const checked = value === o.value;
					return (
						<label key={o.value} className="relative block cursor-pointer">
							<input
								type="radio"
								name={name}
								value={o.value}
								checked={checked}
								onChange={() => onChange(o.value)}
								className="peer sr-only"
							/>
							<span
								className={`flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-3 text-center font-mono text-[12px] font-semibold uppercase tracking-[0.05em] transition-[transform,box-shadow,background-color,color] duration-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[rgb(var(--focus))] ${
									checked
										? "translate-y-[2px] bg-ink text-paper shadow-none"
										: "bg-paper text-ink-2 shadow-[0_2px_0_rgb(var(--rule-2))] ring-1 ring-inset ring-rule-2 hover:text-ink"
								}`}
							>
								{o.swatch && (
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
										style={{ background: o.swatch }}
										aria-hidden
									/>
								)}
								<span className="truncate">{o.label}</span>
							</span>
						</label>
					);
				})}
			</div>
		</fieldset>
	);
}
