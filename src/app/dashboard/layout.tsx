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
		<div className="flex flex-row w-full max-h-screen overflow-x-hidden">
			<Sidebar />

			<main className="relative w-full min-w-0 min-h-screen overflow-x-hidden overflow-y-auto pb-20 lg:pb-0">
				<DashboardHeader />

				<Notifications />

				{children}
			</main>
		</div>
	);
}
