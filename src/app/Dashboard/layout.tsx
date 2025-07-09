import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export const metadata = {
	title: "Dashboard",
	description: "Your personal finance dashboard",
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<div className=" flex flex-row max-h-screen w-full">
					<Sidebar />

					<main className=" w-full">
						<DashboardHeader />

						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
