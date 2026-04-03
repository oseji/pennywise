"use client";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { formatLogoutError } from "@/utils/formatLogoutError";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ellipsis, LogOut, Settings, X } from "lucide-react";

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
    const pathname = usePathname();
    const { close } = useNotificationStore();

    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [showSavingsComingSoon, setShowSavingsComingSoon] =
        useState<boolean>(false);
    const [showProfileComingSoon, setShowProfileComingSoon] =
        useState<boolean>(false);
    const [showHistoryComingSoon, setShowHistoryComingSoon] =
        useState<boolean>(false);

    const isOverviewActive =
        pathname === "/dashboard" || pathname === "/dashboard/overview";
    const isIncomeActive = pathname === "/dashboard/income";
    const isBudgetActive = pathname === "/dashboard/budget";
    const isExpensesActive = pathname === "/dashboard/expenses";
    const isSettingsActive = pathname === "/dashboard/settings";

    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (err) {
            alert(formatLogoutError(err));
        }
    };

    const indicator = (active: boolean) =>
        active ? "sidebarIndicatorActive" : "sidebarIndicator";
    const textClass = (active: boolean) =>
        `sidebarText${active ? " activeSidebarText" : ""}`;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:static lg:mt-20 lg:w-64 lg:border-0 lg:p-6">
            <div className="flex w-full flex-row items-center justify-around lg:flex-col lg:items-start lg:justify-start lg:gap-10">
                <div className="flex w-full flex-row items-center justify-around gap-3 lg:flex-col lg:items-start lg:justify-start lg:gap-4">
                    <h1 className="mb-2 hidden text-slate-400 dark:text-slate-500 lg:block">
                        Overview
                    </h1>

                    <Link
                        href="/dashboard/overview"
                        onClick={() => close()}
                        className="sidebarRow"
                    >
                        <span className={indicator(isOverviewActive)} />
                        <Image src={dashboardIcon} alt="" />
                        <span className={textClass(isOverviewActive)}>
                            Dashboard
                        </span>
                    </Link>

                    <Link
                        href="/dashboard/income"
                        onClick={() => close()}
                        className="sidebarRow"
                    >
                        <span className={indicator(isIncomeActive)} />
                        <Image src={incomeIcon} alt="" />
                        <span className={textClass(isIncomeActive)}>
                            income
                        </span>
                    </Link>

                    <Link
                        href="/dashboard/budget"
                        onClick={() => close()}
                        className="sidebarRow"
                    >
                        <span className={indicator(isBudgetActive)} />
                        <Image src={budgetIcon} alt="" className="" />
                        <span className={textClass(isBudgetActive)}>
                            budget
                        </span>
                    </Link>

                    <Link
                        href="/dashboard/expenses"
                        onClick={() => close()}
                        className="sidebarRow"
                    >
                        <span className={indicator(isExpensesActive)} />
                        <Image src={expensesIcon} alt="" />
                        <span className={textClass(isExpensesActive)}>
                            expenses
                        </span>
                    </Link>

                    <div
                        className="sidebarRow lg:flex"
                        onMouseEnter={() => setShowSavingsComingSoon(true)}
                        onMouseLeave={() => setShowSavingsComingSoon(false)}
                        onClick={() => toast("Savings feature is coming soon!")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                                toast("Savings feature is coming soon!");
                        }}
                    >
                        <span className="sidebarIndicator" />
                        <Image src={savingsIcon} alt="" />
                        <span
                            className={`sidebarText${
                                showSavingsComingSoon
                                    ? " scale-105 font-semibold text-[#2D6A4F] dark:text-[#95D5B2]"
                                    : ""
                            }`}
                        >
                            {showSavingsComingSoon ? "Coming soon" : "savings"}
                        </span>
                    </div>

                    <div
                        className="sidebarRow lg:flex"
                        onMouseEnter={() => setShowProfileComingSoon(true)}
                        onMouseLeave={() => setShowProfileComingSoon(false)}
                        onClick={() => toast("Profile feature is coming soon!")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                                toast("Profile feature is coming soon!");
                        }}
                    >
                        <span className="sidebarIndicator" />
                        <Image src={profileIcon} alt="" />
                        <span
                            className={`sidebarText${
                                showProfileComingSoon
                                    ? " scale-105 font-semibold text-[#2D6A4F] dark:text-[#95D5B2]"
                                    : ""
                            }`}
                        >
                            {showProfileComingSoon ? "Coming soon" : "profile"}
                        </span>
                    </div>

                    <div
                        className="sidebarRow lg:flex"
                        onMouseEnter={() => setShowHistoryComingSoon(true)}
                        onMouseLeave={() => setShowHistoryComingSoon(false)}
                        onClick={() => toast("History feature is coming soon!")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                                toast("History feature is coming soon!");
                        }}
                    >
                        <span className="sidebarIndicator" />
                        <Image src={historyIcon} alt="" />
                        <span
                            className={`sidebarText${
                                showHistoryComingSoon
                                    ? " scale-105 font-semibold text-[#2D6A4F] dark:text-[#95D5B2]"
                                    : ""
                            }`}
                        >
                            {showHistoryComingSoon ? "Coming soon" : "history"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="flex w-auto flex-row items-center justify-center gap-2 lg:hidden"
                    onClick={() => setIsMoreOpen(true)}
                    aria-label="Open menu"
                >
                    <Ellipsis className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </button>

                <div className="hidden lg:flex lg:flex-col lg:gap-4">
                    <h1 className="mb-2 hidden text-slate-400 dark:text-slate-500 lg:block">
                        Others
                    </h1>

                    <Link
                        href="/dashboard/settings"
                        onClick={() => close()}
                        className="ml-3 sidebarRow"
                    >
                        <Image src={settingsIcon} alt="" />
                        <span className={textClass(isSettingsActive)}>
                            settings
                        </span>
                    </Link>

                    <div className="ml-3 sidebarRow" onClick={logout}>
                        <Image src={logoutIcon} alt="" />
                        <span className="sidebarText">logout</span>
                    </div>
                </div>
            </div>

            {/* Mobile More sheet */}
            <div
                className={`fixed inset-0 z-50 lg:hidden ${
                    isMoreOpen ? "flex" : "hidden"
                } items-end justify-center`}
                role="presentation"
            >
                <button
                    type="button"
                    className="absolute inset-0 bg-black/40"
                    aria-label="Close menu"
                    onClick={() => setIsMoreOpen(false)}
                />
                <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
                    <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Menu
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsMoreOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setIsMoreOpen(false)}
                            className="flex flex-row items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600"
                        >
                            <Settings className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                Settings
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setIsMoreOpen(false);
                                logout();
                            }}
                            className="flex flex-row items-center gap-3 rounded-lg bg-red-500 p-3 text-white"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
