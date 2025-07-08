import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";

const DashboardPage = () => {
	return (
		<div className=" flex flex-row max-h-screen min-w-full">
			{/* sidebar */}
			<Sidebar />

			{/* main content */}
			<Dashboard />
		</div>
	);
};

export default DashboardPage;
