"use client";

import { flushSync } from "react-dom";
import { useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { usePreferencesStore } from "@/store/usePreferencesStore";

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => unknown };

/** Switches theme; the new theme prints over the old one (see ::view-transition in globals.css). */
export function useSwitchTheme() {
	const setTheme = usePreferencesStore((s) => s.setTheme);
	const reduced = useReducedMotion();
	return (next: "light" | "dark") => {
		const doc = document as ViewTransitionDoc;
		if (!doc.startViewTransition || reduced) {
			setTheme(next);
			return;
		}
		doc.startViewTransition(() => flushSync(() => setTheme(next)));
	};
}

export function ThemeToggle({ className = "" }: { className?: string }) {
	const theme = usePreferencesStore((s) => s.theme);
	const switchTheme = useSwitchTheme();
	const dark = theme === "dark";

	return (
		<button
			type="button"
			onClick={() => switchTheme(dark ? "light" : "dark")}
			className={`key-icon ${className}`}
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
		</button>
	);
}
