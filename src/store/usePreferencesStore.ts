import { create } from "zustand";

export type CurrencyCode = "NGN" | "USD" | "EUR";
export type ThemePreference = "light" | "dark";

const STORAGE_CURRENCY = "pennywise-currency";
const STORAGE_THEME = "pennywise-theme";

function applyThemeClass(theme: ThemePreference) {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", theme === "dark");
}

type PreferencesState = {
	currency: CurrencyCode;
	theme: ThemePreference;
	setCurrency: (c: CurrencyCode) => void;
	setTheme: (t: ThemePreference) => void;
	toggleTheme: () => void;
	hydrateFromStorage: () => void;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
	currency: "NGN",
	theme: "light",
	setCurrency: (currency) => {
		set({ currency });
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_CURRENCY, currency);
		}
	},
	setTheme: (theme) => {
		set({ theme });
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_THEME, theme);
			applyThemeClass(theme);
		}
	},
	toggleTheme: () => {
		const next = get().theme === "dark" ? "light" : "dark";
		get().setTheme(next);
	},
	hydrateFromStorage: () => {
		if (typeof window === "undefined") return;
		const rawC = localStorage.getItem(STORAGE_CURRENCY) as CurrencyCode | null;
		const rawT = localStorage.getItem(STORAGE_THEME) as ThemePreference | null;
		const currency: CurrencyCode =
			rawC === "NGN" || rawC === "USD" || rawC === "EUR" ? rawC : "NGN";
		const theme: ThemePreference =
			rawT === "dark" || rawT === "light" ? rawT : "light";
		set({ currency, theme });
		applyThemeClass(theme);
	},
}));
