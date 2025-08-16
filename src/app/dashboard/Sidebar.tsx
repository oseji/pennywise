"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { formatLogoutError } from "@/utils/formatLogoutError";
import { useNotificationStore } from "@/store/useNotificationStore";

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
	const router = useRouter();
	const { close } = useNotificationStore();

	const [errorMessage, setErrorMessage] = useState<string>("");

	const sideBarItems = useRef<(HTMLSpanElement | null)[]>([]);
	const sideBarTexts = useRef<(HTMLSpanElement | null)[]>([]);

	const toggleActiveSidebaritem = (index: number) => {
		sideBarItems.current.forEach((item, itemNumber) => {
			if (index === itemNumber) {
				item?.classList.add("sidebarIndicatorActive");
			} else {
				item?.classList.remove("sidebarIndicatorActive");
				item?.classList.add("sidebarIndicator");
			}
		});

		sideBarTexts.current.forEach((item, itemNumber) => {
			if (index === itemNumber) {
				item?.classList.add("activeSidebarText");
			} else {
				item?.classList.remove("activeSidebarText");
			}
		});
	};

	const logout = async () => {
		try {
			await signOut(auth);
			console.log("User successfully logged out");

			router.push("/");
		} catch (err) {
			const message = formatLogoutError(err);
			setErrorMessage(message);
			alert(errorMessage);
		}
	};

	return (
		<div className="w-auto p-4 mt-20 md:p-6 md:w-64">
			<div className="flex flex-col items-start gap-10 ">
				<div className="flex flex-col w-full gap-4">
					<h1 className="hidden mb-2 text-slate-400 md:block">Overview</h1>

					<Link href={"/dashboard/overview"}>
						<div
							className=" sidebarRow"
							onClick={() => {
								toggleActiveSidebaritem(0);
								close();
							}}
						>
							<span
								className=" sidebarIndicatorActive"
								ref={(el) => {
									sideBarItems.current[0] = el;
								}}
							></span>
							<Image src={dashboardIcon} alt="Dashboard" />
							<span
								className=" sidebarText activeSidebarText"
								ref={(el) => {
									sideBarTexts.current[0] = el;
								}}
							>
								Dashboard
							</span>
						</div>
					</Link>

					<Link href={"/dashboard/income"}>
						<div
							className=" sidebarRow"
							onClick={() => {
								toggleActiveSidebaritem(1);
								close();
							}}
						>
							<span
								className=" sidebarIndicator"
								ref={(el) => {
									sideBarItems.current[1] = el;
								}}
							></span>
							<Image src={incomeIcon} alt="income" />
							<span
								className=" sidebarText"
								ref={(el) => {
									sideBarTexts.current[1] = el;
								}}
							>
								income
							</span>
						</div>
					</Link>

					<Link href={"/dashboard/budget"}>
						<div
							className=" sidebarRow"
							onClick={() => {
								toggleActiveSidebaritem(2);
								close();
							}}
						>
							<span
								className=" sidebarIndicator"
								ref={(el) => {
									sideBarItems.current[2] = el;
								}}
							></span>
							<Image src={budgetIcon} alt="budget" className="" />
							<span
								className=" sidebarText"
								ref={(el) => {
									sideBarTexts.current[2] = el;
								}}
							>
								budget
							</span>
						</div>
					</Link>

					<Link href={"/dashboard/expenses"}>
						<div
							className=" sidebarRow"
							onClick={() => {
								toggleActiveSidebaritem(3);
								close();
							}}
						>
							<span
								className=" sidebarIndicator"
								ref={(el) => {
									sideBarItems.current[3] = el;
								}}
							></span>
							<Image src={expensesIcon} alt="expenses" />
							<span
								className=" sidebarText"
								ref={(el) => {
									sideBarTexts.current[3] = el;
								}}
							>
								expenses
							</span>
						</div>
					</Link>

					<Link href={"/dashboard/savings"}>
						<div
							className=" sidebarRow"
							onClick={() => {
								toggleActiveSidebaritem(4);
								close();
							}}
						>
							<span
								className=" sidebarIndicator"
								ref={(el) => {
									sideBarItems.current[4] = el;
								}}
							></span>
							<Image src={savingsIcon} alt="savings" />
							<span
								className=" sidebarText"
								ref={(el) => {
									sideBarTexts.current[4] = el;
								}}
							>
								savings
							</span>
						</div>
					</Link>

					<div
						className=" sidebarRow"
						onClick={() => {
							toggleActiveSidebaritem(5);
							close();
						}}
					>
						<span
							className=" sidebarIndicator"
							ref={(el) => {
								sideBarItems.current[5] = el;
							}}
						></span>
						<Image src={profileIcon} alt="profile" />
						<span
							className=" sidebarText"
							ref={(el) => {
								sideBarTexts.current[5] = el;
							}}
						>
							profile
						</span>
					</div>

					<div
						className=" sidebarRow"
						onClick={() => {
							toggleActiveSidebaritem(6);
							close();
						}}
					>
						<span
							className=" sidebarIndicator"
							ref={(el) => {
								sideBarItems.current[6] = el;
							}}
						></span>
						<Image src={historyIcon} alt="history" />
						<span
							className=" sidebarText"
							ref={(el) => {
								sideBarTexts.current[6] = el;
							}}
						>
							history
						</span>
					</div>
				</div>

				<Link href={"/dashboard/settings"}>
					<div className="flex flex-col gap-4 ">
						<h1 className="hidden mb-2 text-slate-400 md:block">Others</h1>

						<div
							className="ml-3 sidebarRow"
							onClick={() => {
								toggleActiveSidebaritem(7);
								close();
							}}
						>
							<Image src={settingsIcon} alt="settings" />
							<span
								className=" sidebarText"
								ref={(el) => {
									sideBarTexts.current[7] = el;
								}}
							>
								settings
							</span>
						</div>

						<div className="ml-3 sidebarRow" onClick={logout}>
							<Image src={logoutIcon} alt="logout" />
							<span className=" sidebarText">logout</span>
						</div>
					</div>
				</Link>
			</div>
		</div>
	);
};

export default Sidebar;
