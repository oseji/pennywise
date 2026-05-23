import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import Notifications from "./Notifications";

export const metadata = {
	title: "Pennywise | Dashboard",
	description: "Your personal finance dashboard",
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-row w-full min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-dark-base">
			<Sidebar />

			<main className="relative w-full min-w-0 min-h-screen overflow-x-hidden overflow-y-auto pb-24 lg:pb-0 lg:pl-60">
				<DashboardHeader />
				<Notifications />
				{children}
			</main>
		</div>
	);
}
