import { Chivo, Chivo_Mono } from "next/font/google";

// Chivo Mono carries every figure and printed label (and has the ₦ glyph,
// which most monos on Google Fonts drop); Chivo carries explanatory text.
export const chivo = Chivo({
	subsets: ["latin", "latin-ext"],
	variable: "--font-sans",
	display: "swap",
});

export const chivoMono = Chivo_Mono({
	subsets: ["latin", "latin-ext"],
	variable: "--font-mono",
	display: "swap",
});
