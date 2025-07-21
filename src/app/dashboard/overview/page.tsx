"use client";

import { Cell, Pie, PieChart } from "recharts";

const Dashboard = () => {
	const data = [
		{ name: "Group A", value: 400 },
		{ name: "Group B", value: 300 },
		{ name: "Group C", value: 300 },
		{ name: "Group D", value: 200 },
	];

	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

	return (
		<div className="dashboardScreen">
			<h1 className="dashboardHeading">dashboard</h1>

			<div className="flex flex-row items-center justify-between gap-10">
				<div className=" chartBox">
					<div className="chartBoxHeadingGroup">
						<h1>Income</h1>

						<span>amount</span>
					</div>

					<PieChart width={200} height={200}>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={80}
							fill="#8884d8"
							paddingAngle={1}
							dataKey="value"
							className="outline-none"
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>
				</div>

				<div className=" chartBox">
					<div className="chartBoxHeadingGroup">
						<h1>Expenditure</h1>

						<span>amount</span>
					</div>

					<PieChart width={200} height={200}>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={80}
							fill="#8884d8"
							paddingAngle={1}
							dataKey="value"
							className="outline-none"
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>
				</div>

				<div className=" chartBox">
					<div className="chartBoxHeadingGroup">
						<h1>Savings</h1>

						<span>amount</span>
					</div>

					<PieChart width={200} height={200}>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={80}
							fill="#8884d8"
							paddingAngle={1}
							dataKey="value"
							className="outline-none"
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${entry.name}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
					</PieChart>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
