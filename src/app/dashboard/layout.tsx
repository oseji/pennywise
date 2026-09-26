import { Shell } from "./Shell";

export const metadata = {
	title: "Pennywise | Dashboard",
	description: "Your personal finance dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <Shell>{children}</Shell>;
}
