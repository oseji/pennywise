import type { Metadata, Viewport } from "next";
import "./globals.css";
import { chivo, chivoMono } from "./fonts";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
	title: "Pennywise",
	description: "Track income, spending and budget limits — one honest total, the breakdown underneath.",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#e3e7e2" },
		{ media: "(prefers-color-scheme: dark)", color: "#0b0e0d" },
	],
};

// Applies the saved (or OS) theme before first paint so dark users never see a light flash.
const themeBoot = `(function(){try{var t=localStorage.getItem("pennywise-theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={`${chivo.variable} ${chivoMono.variable}`}>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeBoot }} />
			</head>
			<body>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
