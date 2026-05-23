/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					50:  "#f0fdf6",
					100: "#dcfce8",
					200: "#bbf7d2",
					300: "#74c69d",
					400: "#40916c",
					500: "#2d6a4f",
					600: "#1b4332",
					700: "#163727",
					800: "#102b1e",
					900: "#0b1f15",
				},
				surface: {
					DEFAULT: "#ffffff",
					secondary: "#f7f7f8",
					tertiary: "#f0f0f2",
				},
				dark: {
					base:    "#0a0a0b",
					surface: "#111113",
					raised:  "#18181b",
					overlay: "#1f1f23",
					border:  "#2a2a2e",
					muted:   "#3f3f46",
				},
			},
			boxShadow: {
				"glow-green": "0 0 20px -4px rgba(45,106,79,0.35)",
				"glow-green-lg": "0 0 40px -8px rgba(45,106,79,0.25)",
				"card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
				"card-md": "0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
				"dark-card": "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
				"dark-card-md": "0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
			},
			backgroundImage: {
				"gradient-brand": "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
				"gradient-brand-hover": "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
				"gradient-dark-surface": "linear-gradient(145deg, #18181b 0%, #1f1f23 100%)",
			},
		},
	},
	plugins: [],
};
