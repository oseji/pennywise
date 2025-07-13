import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { satoshiVariable } from "./fonts/satoshi";

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
		<html lang="en">
			<body className={`${satoshiVariable.className} antialiased`}>
				<Toaster position="top-center" />
				{children}
			</body>
		</html>
	);
}
