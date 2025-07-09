"use client";
import Image from "next/image";
import Link from "next/link";

import dashboardIcon from "../../assets/sidebar/dashboard.svg";
import incomeIcon from "../../assets/sidebar/income.svg";
import budgetIcon from "../../assets/sidebar/budget.svg";
import expensesIcon from "../../assets/sidebar/expenses.svg";
import savingsIcon from "../../assets/sidebar/savings.svg";
import profileIcon from "../../assets/sidebar/profile.svg";
import historyIcon from "../../assets/sidebar/history.svg";
import settingsIcon from "../../assets/sidebar/settings.svg";
import logoutIcon from "../../assets/sidebar/logout.svg";

const Sidebar = () => {
	return (
		<div className=" p-6">
			<div className=" flex flex-row items-center justify-center gap-4 font-bold text-2xl mb-4 border-b border-slate-400 pb-4 px-6">
				<span className=" rounded-full bg-[#B7E4C7] text-[#40916C] px-4 py-2">
					P
				</span>

				<span>Pennywise</span>
			</div>

			<div className=" flex flex-col gap-10 items-start">
				<div className=" flex flex-col gap-4">
					<h1 className=" text-slate-400 mb-2">Overview</h1>

					<Link href={"/Dashboard/overview"}>
						<div className=" sidebarRow">
							<span className=" sidebarIndicatorActive"></span>
							<Image src={dashboardIcon} alt="Dashboard" />
							<span>Dashboard</span>
						</div>
					</Link>

					<Link href={"/Dashboard/income"}>
						<div className=" sidebarRow">
							<span className=" sidebarIndicator"></span>
							<Image src={incomeIcon} alt="income" />
							<span>income</span>
						</div>
					</Link>

					<div className=" sidebarRow">
						<span className=" sidebarIndicator"></span>
						<Image src={budgetIcon} alt="budget" />
						<span>budget</span>
					</div>

					<div className=" sidebarRow">
						<span className=" sidebarIndicator"></span>
						<Image src={expensesIcon} alt="expenses" />
						<span>expenses</span>
					</div>

					<div className=" sidebarRow">
						<span className=" sidebarIndicator"></span>
						<Image src={savingsIcon} alt="savings" />
						<span>savings</span>
					</div>

					<div className=" sidebarRow">
						<span className=" sidebarIndicator"></span>
						<Image src={profileIcon} alt="profile" />
						<span>profile</span>
					</div>

					<div className=" sidebarRow">
						<span className=" sidebarIndicator"></span>
						<Image src={historyIcon} alt="history" />
						<span>history</span>
					</div>
				</div>

				<div className=" flex flex-col gap-4">
					<h1 className=" text-slate-400 mb-2">Others</h1>

					<div className=" sidebarRow">
						<Image src={settingsIcon} alt="settings" />
						<span>settings</span>
					</div>

					<div className=" sidebarRow">
						<Image src={logoutIcon} alt="logout" />
						<span>logout</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sidebar;
