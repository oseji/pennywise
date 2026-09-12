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
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
			>
				Skip to content
			</a>
			<Sidebar />

			<main
				id="main-content"
				tabIndex={-1}
				className="relative w-full min-w-0 min-h-screen overflow-x-hidden overflow-y-auto pb-24 outline-none lg:pb-0 lg:pl-60"
			>
				<DashboardHeader />
				<Notifications />
				{children}
			</main>
		</div>
	);
}
