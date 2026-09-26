"use client";

import { useRef } from "react";
import { currencyParts } from "@/utils/formatMoney";
import type { CurrencyCode } from "@/store/usePreferencesStore";

/** Digits and one decimal point (like the old number inputs), grouped with commas as you type. */
export function groupAmount(raw: string): string {
	let s = raw.replace(/[^\d.]/g, "");
	const dot = s.indexOf(".");
	if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "").slice(0, 2);
	const [int, frac] = s.split(".");
	const intClean = int.replace(/^0+(?=\d)/, "");
	const grouped = intClean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return frac !== undefined ? `${grouped || "0"}.${frac}` : grouped;
}

/** The plain numeric string the data layer expects ("2500.5"). */
export const plainAmount = (formatted: string) => formatted.replace(/,/g, "");

type Props = {
	id: string;
	value: string;
	onChange: (formatted: string) => void;
	currency: CurrencyCode;
	size?: "lg" | "md";
	invalid?: boolean;
	describedBy?: string;
	/** Marks this field as the dialog's first focus target. */
	autoFocus?: boolean;
};

export function AmountInput({ id, value, onChange, currency, size = "lg", invalid, describedBy, autoFocus }: Props) {
	const ref = useRef<HTMLInputElement>(null);
	const symbol = currencyParts(0, currency).find((p) => p.type === "currency")?.value ?? currency;

	const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
		const el = e.target;
		const caret = el.selectionStart ?? el.value.length;
		// keep the caret after the same number of significant characters
		const significantBefore = el.value.slice(0, caret).replace(/[^\d.]/g, "").length;
		const next = groupAmount(el.value);
		onChange(next);
		requestAnimationFrame(() => {
			if (!ref.current) return;
			let seen = 0;
			let pos = next.length;
			for (let i = 0; i < next.length; i++) {
				if (seen === significantBefore) {
					pos = i;
					break;
				}
				if (/[\d.]/.test(next[i])) seen++;
			}
			ref.current.setSelectionRange(pos, pos);
		});
	};

	const lg = size === "lg";
	return (
		<div
			className={`flex items-baseline gap-2 rounded-[6px] border bg-paper px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-key focus-within:ring-2 focus-within:ring-key/25 dark:bg-ground-2 ${
				invalid ? "border-neg" : "border-rule-2 hover:border-ink-3"
			} ${lg ? "py-2.5" : "py-1.5"}`}
		>
			<span className={`font-mono font-semibold text-ink-3 ${lg ? "text-[22px]" : "text-[16px]"}`} aria-hidden>
				{symbol}
			</span>
			<input
				ref={ref}
				id={id}
				name={id}
				inputMode="decimal"
				autoComplete="off"
				placeholder="0.00"
				value={value}
				onChange={handle}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				data-autofocus={autoFocus || undefined}
				className={`min-w-0 flex-1 bg-transparent font-mono font-semibold tabular-nums text-ink outline-none placeholder:text-ink-3 ${
					lg ? "text-[34px] leading-tight" : "text-[18px]"
				}`}
			/>
		</div>
	);
}
