import type { CurrencyCode } from "@/store/usePreferencesStore";

export function formatMoney(amount: number, currency: CurrencyCode): string {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			maximumFractionDigits: 2,
		}).format(amount);
	} catch {
		return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
	}
}

// Display formatting. formatMoney above stays as-is because its output is
// written into notification documents; the UI uses these instead (₦ rather
// than "NGN", a true minus sign, compact axis labels).
const MINUS = "−";

export function formatCurrency(
	amount: number,
	currency: CurrencyCode,
	{ signed = false, compact = false }: { signed?: boolean; compact?: boolean } = {}
): string {
	try {
		const s = new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			currencyDisplay: "narrowSymbol",
			...(compact
				? { notation: "compact", maximumFractionDigits: 1 }
				: { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
			signDisplay: signed ? "exceptZero" : "auto",
		}).format(amount);
		return s.replace("-", MINUS);
	} catch {
		return formatMoney(amount, currency);
	}
}

export function currencyParts(amount: number, currency: CurrencyCode): Intl.NumberFormatPart[] {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			currencyDisplay: "narrowSymbol",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
			.formatToParts(amount)
			.map((p) => (p.type === "minusSign" ? { ...p, value: MINUS } : p));
	} catch {
		return [{ type: "literal", value: formatMoney(amount, currency) }];
	}
}

export const formatPercent = (ratio: number, digits = 0) =>
	`${(ratio * 100).toFixed(digits)}%`;
