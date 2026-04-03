"use client";

import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";

import avatarIcon from "../../assets/dashboard/avatar.svg";

const DashboardHeader = () => {
	const { toggle } = useNotificationStore();
	const { theme, toggleTheme } = usePreferencesStore();

	return (
		<div className="fixed left-0 top-0 z-30 flex w-full flex-row items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 md:px-12">
			<div className="flex flex-row items-center justify-center gap-4 text-xl font-bold md:text-2xl">
				<span className="rounded-full bg-[#B7E4C7] px-4 py-2 text-[#40916C] dark:bg-[#2D6A4F] dark:text-[#D8F3DC]">
					P
				</span>

				<span className="hidden text-slate-900 dark:text-slate-100 md:block">
					Pennywise
				</span>
			</div>

			<div className="flex flex-row items-center gap-2 md:gap-4">
				<button
					type="button"
					onClick={toggleTheme}
					className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
					aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
				>
					{theme === "dark" ? (
						<Sun className="h-6 w-6" aria-hidden />
					) : (
						<Moon className="h-6 w-6" aria-hidden />
					)}
				</button>

				<button
					type="button"
					onClick={toggle}
					className="rounded-lg p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
					aria-label="Open notifications"
				>
					<Bell className="h-7 w-7" />
				</button>
				<Image src={avatarIcon} alt="" className="h-9 w-9" />
			</div>
		</div>
	);
};

export default DashboardHeader;
