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
		<div className="flex flex-row w-full max-h-screen ">
			<Sidebar />

			<main className="relative w-full min-h-screen overflow-y-scroll">
				<DashboardHeader />

				<Notifications />

				{children}
			</main>
		</div>
	);
}
