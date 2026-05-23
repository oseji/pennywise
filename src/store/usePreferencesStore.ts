import { create } from "zustand";

export type CurrencyCode = "NGN" | "USD" | "EUR";
export type ThemePreference = "light" | "dark";

const STORAGE_CURRENCY = "pennywise-currency";
const STORAGE_THEME = "pennywise-theme";
const STORAGE_NOTIFICATIONS = "pennywise-notifications";

function applyThemeClass(theme: ThemePreference) {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", theme === "dark");
}

type PreferencesState = {
	currency: CurrencyCode;
	theme: ThemePreference;
	notificationsEnabled: boolean;
	setCurrency: (c: CurrencyCode) => void;
	setTheme: (t: ThemePreference) => void;
	toggleTheme: () => void;
	setNotificationsEnabled: (v: boolean) => void;
	hydrateFromStorage: () => void;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
	currency: "NGN",
	theme: "light",
	notificationsEnabled: true,
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
	setNotificationsEnabled: (v) => {
		set({ notificationsEnabled: v });
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_NOTIFICATIONS, String(v));
		}
	},
	hydrateFromStorage: () => {
		if (typeof window === "undefined") return;
		const rawC = localStorage.getItem(STORAGE_CURRENCY) as CurrencyCode | null;
		const rawT = localStorage.getItem(STORAGE_THEME) as ThemePreference | null;
		const rawN = localStorage.getItem(STORAGE_NOTIFICATIONS);
		const currency: CurrencyCode =
			rawC === "NGN" || rawC === "USD" || rawC === "EUR" ? rawC : "NGN";
		const theme: ThemePreference =
			rawT === "dark" || rawT === "light" ? rawT : "light";
		const notificationsEnabled = rawN === null ? true : rawN === "true";
		set({ currency, theme, notificationsEnabled });
		applyThemeClass(theme);
	},
}));
