/** @type {import('tailwindcss').Config} */

// Every colour resolves to a channel triplet in globals.css, so one class
// works in both themes and still takes Tailwind's /alpha modifier.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
	darkMode: "class",
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
		"./src/utils/**/*.{js,ts,jsx,tsx}",
		"./src/lib/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
			},
			colors: {
				ground: { DEFAULT: token("ground"), 2: token("ground-2") },
				paper: { DEFAULT: token("paper"), 2: token("paper-2"), 3: token("paper-3") },
				ink: { DEFAULT: token("ink"), 2: token("ink-2"), 3: token("ink-3") },
				rule: { DEFAULT: token("rule"), 2: token("rule-2") },
				term: {
					DEFAULT: token("term"),
					2: token("term-2"),
					3: token("term-3"),
					ink: token("term-ink"),
					"ink-2": token("term-ink-2"),
					rule: token("term-rule"),
				},
				key: { DEFAULT: token("key"), hover: token("key-hover"), edge: token("key-edge") },
				pos: { DEFAULT: token("pos"), soft: token("pos-soft") },
				neg: { DEFAULT: token("neg"), soft: token("neg-soft") },
				warn: { DEFAULT: token("warn"), soft: token("warn-soft"), fill: token("warn-fill") },
				chart: {
					in: token("chart-in"),
					out: token("chart-out"),
					daily: token("chart-daily"),
					planned: token("chart-planned"),
					others: token("chart-others"),
				},
			},
			borderRadius: {
				paper: "3px",
				key: "10px",
			},
			boxShadow: {
				// paper lying on the counter
				slip: "0 1px 0 rgb(18 22 20 / 0.05), 0 12px 24px -16px rgb(18 22 20 / 0.45)",
				lift: "0 2px 0 rgb(18 22 20 / 0.06), 0 22px 40px -22px rgb(18 22 20 / 0.55)",
			},
			transitionTimingFunction: {
				out: "cubic-bezier(0.16, 1, 0.3, 1)",
			},
			keyframes: {
				"feed-pulse": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.45" },
				},
			},
			animation: {
				"feed-pulse": "feed-pulse 1.6s ease-in-out infinite",
			},
		},
	},
	plugins: [require("@tailwindcss/container-queries")],
};
