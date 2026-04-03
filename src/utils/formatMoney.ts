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
