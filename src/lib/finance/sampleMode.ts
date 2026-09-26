// Dev-only preview data. In production builds SAMPLE_MODE_AVAILABLE is a
// literal false, so the sample repo and fixtures are never bundled.
export type SampleMode = "full" | "empty";

export const SAMPLE_MODE_AVAILABLE = process.env.NODE_ENV === "development";

const KEY = "pennywise-sample-data";

/** `?sample=full|empty|off` sets the mode; otherwise the last choice is remembered. */
export function readSampleMode(): SampleMode | null {
	if (!SAMPLE_MODE_AVAILABLE || typeof window === "undefined") return null;
	try {
		const q = new URLSearchParams(window.location.search).get("sample");
		if (q === "full" || q === "empty") localStorage.setItem(KEY, q);
		if (q === "off") localStorage.removeItem(KEY);
		const v = localStorage.getItem(KEY);
		return v === "full" || v === "empty" ? v : null;
	} catch {
		return null;
	}
}

export function writeSampleMode(mode: SampleMode | null) {
	try {
		if (mode) localStorage.setItem(KEY, mode);
		else localStorage.removeItem(KEY);
	} catch {
		// storage blocked: the toggle simply won't persist
	}
}
