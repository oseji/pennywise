import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { satoshiVariable } from "./fonts/satoshi";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
	title: "Pennywise",
	description: "Expenses app for managing finances",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${satoshiVariable.className} antialiased bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100`}
			>
				<AppProviders>
					<Toaster position="top-center" />

					{children}
				</AppProviders>
			</body>
		</html>
	);
}
