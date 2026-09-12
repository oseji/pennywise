// Single source of truth for chart + legend colours. Values resolve to the
// --chart-N custom properties in globals.css, which swap per theme, so the
// same string works as an SVG fill and as a CSS background-color.
export const CHART_COLORS = Array.from(
	{ length: 10 },
	(_, i) => `var(--chart-${i + 1})`,
);
