"use client";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
    const { close } = useNotificationStore();

    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [showSavingsComingSoon, setShowSavingsComingSoon] =
        useState<boolean>(false);
    const [showProfileComingSoon, setShowProfileComingSoon] =
        useState<boolean>(false);
    const [showHistoryComingSoon, setShowHistoryComingSoon] =
        useState<boolean>(false);

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
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white border-t border-slate-200 lg:static lg:border-0 lg:bg-transparent lg:w-64 lg:p-6 lg:mt-20">
            <div className="flex flex-row items-center justify-around w-full lg:flex-col lg:items-start lg:justify-start lg:gap-10">
                <div className="flex flex-row items-center justify-around w-full gap-3 lg:flex-col lg:items-start lg:justify-start lg:gap-4">
                    <h1 className="hidden mb-2 text-slate-400 lg:block">
                        Overview
                    </h1>

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

                    <div
                        className="sidebarRow lg:flex"
                        onMouseEnter={() => setShowSavingsComingSoon(true)}
                        onMouseLeave={() => setShowSavingsComingSoon(false)}
                        onClick={() => toast("Savings feature is coming soon!")}

                        // onClick={() => {
                        // 	toggleActiveSidebaritem(4);
                        // 	close();
                        // }}
                    >
                        <span
                            className=" sidebarIndicator"
                            ref={(el) => {
                                sideBarItems.current[4] = el;
                            }}
                        ></span>
                        <Image src={savingsIcon} alt="savings" />
                        <span
                            className={` sidebarText ${
                                showSavingsComingSoon
                                    ? " scale-105 text-[#2D6A4F] font-semibold"
                                    : ""
                            }`}
                            ref={(el) => {
                                sideBarTexts.current[4] = el;
                            }}
                        >
                            {showSavingsComingSoon ? "Coming soon" : "savings"}
                        </span>
                    </div>

                    <div
                        className="sidebarRow lg:flex"
                        onMouseEnter={() => setShowProfileComingSoon(true)}
                        onMouseLeave={() => setShowProfileComingSoon(false)}
                        onClick={() => toast("Profile feature is coming soon!")}

                        // onClick={() => {
                        // 	toggleActiveSidebaritem(5);
                        // 	close();
                        // }}
                    >
                        <span
                            className=" sidebarIndicator"
                            ref={(el) => {
                                sideBarItems.current[5] = el;
                            }}
                        ></span>
                        <Image src={profileIcon} alt="profile" />
                        <span
                            className={` sidebarText ${
                                showProfileComingSoon
                                    ? " scale-105 text-[#2D6A4F] font-semibold"
                                    : ""
                            }`}
                            ref={(el) => {
                                sideBarTexts.current[5] = el;
                            }}
                        >
                            {showProfileComingSoon
                                ? "Coming soon"
                                : "profile"}{" "}
                        </span>
                    </div>

                    <div
                        className="sidebarRow lg:flex"
                        onMouseEnter={() => setShowHistoryComingSoon(true)}
                        onMouseLeave={() => setShowHistoryComingSoon(false)}
                        onClick={() => toast("History feature is coming soon!")}

                        // onClick={() => {
                        //     toggleActiveSidebaritem(6);
                        //     close();
                        // }}
                    >
                        <span
                            className=" sidebarIndicator"
                            ref={(el) => {
                                sideBarItems.current[6] = el;
                            }}
                        ></span>
                        <Image src={historyIcon} alt="history" />
                        <span
                            className={` sidebarText ${
                                showHistoryComingSoon
                                    ? " scale-105 text-[#2D6A4F] font-semibold"
                                    : ""
                            }`}
                            ref={(el) => {
                                sideBarTexts.current[6] = el;
                            }}
                        >
                            {showHistoryComingSoon
                                ? "Coming soon"
                                : "history"}{" "}
                        </span>
                    </div>
                </div>

                {/* Mobile "More" menu (last item) */}
                <button
                    type="button"
                    className="flex flex-row items-center justify-center w-auto gap-2 lg:hidden"
                    onClick={() => setIsMoreOpen(true)}
                    aria-label="Open menu"
                >
                    <Ellipsis className="w-6 h-6 text-slate-700" />
                </button>

                <Link href={"/dashboard/settings"}>
                    <div className="hidden lg:flex lg:flex-col lg:gap-4">
                        <h1 className="hidden mb-2 text-slate-400 lg:block">
                            Others
                        </h1>

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

            {/* Mobile More sheet */}
            <div
                className={`fixed inset-0 z-50 lg:hidden ${
                    isMoreOpen ? "flex" : "hidden"
                } items-end justify-center`}
            >
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setIsMoreOpen(false)}
                />

                <div className="relative z-10 w-full max-w-md p-4 bg-white rounded-t-2xl shadow-xl">
                    <div className="flex flex-row items-center justify-between pb-3 border-b border-slate-200">
                        <p className="font-semibold">Menu</p>
                        <button
                            type="button"
                            onClick={() => setIsMoreOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Link
                            href={"/dashboard/settings"}
                            onClick={() => setIsMoreOpen(false)}
                            className="flex flex-row items-center gap-3 p-3 border rounded-lg border-slate-200"
                        >
                            <Settings className="w-5 h-5 text-slate-700" />
                            <span className="font-medium">Settings</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setIsMoreOpen(false);
                                logout();
                            }}
                            className="flex flex-row items-center gap-3 p-3 text-white bg-red-500 rounded-lg"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
