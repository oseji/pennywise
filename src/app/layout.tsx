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
				className={`${satoshiVariable.className} antialiased bg-zinc-50 text-zinc-900 transition-colors duration-200 dark:bg-dark-base dark:text-zinc-100`}
			>
				<AppProviders>
					<Toaster position="top-center" />

					{children}
				</AppProviders>
			</body>
		</html>
	);
}
