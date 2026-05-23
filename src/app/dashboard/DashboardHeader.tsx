"use client";

import Image from "next/image";
import { Moon, Sun, Bell } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";

import avatarIcon from "../../assets/dashboard/avatar.svg";

const DashboardHeader = () => {
	const { toggle } = useNotificationStore();
	const { theme, toggleTheme } = usePreferencesStore();

	return (
		<header className="fixed left-0 top-0 z-30 flex w-full flex-row items-center justify-between
		                   border-b border-zinc-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl
		                   dark:border-dark-border dark:bg-dark-surface/90
		                   md:px-10">

			{/* Brand */}
			<div className="flex flex-row items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-glow-green">
					<span className="text-base font-black text-white tracking-tight">P</span>
				</div>
				<span className="hidden text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:block">
					Pennywise
				</span>
			</div>

			{/* Actions */}
			<div className="flex flex-row items-center gap-1 md:gap-2">
				<button
					type="button"
					onClick={toggleTheme}
					className="rounded-xl p-2.5 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900
					           dark:text-zinc-400 dark:hover:bg-dark-overlay dark:hover:text-zinc-100"
					aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
				>
					{theme === "dark" ? (
						<Sun className="h-5 w-5" aria-hidden />
					) : (
						<Moon className="h-5 w-5" aria-hidden />
					)}
				</button>

				<button
					type="button"
					onClick={toggle}
					className="relative rounded-xl p-2.5 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900
					           dark:text-zinc-400 dark:hover:bg-dark-overlay dark:hover:text-zinc-100"
					aria-label="Open notifications"
				>
					<Bell className="h-5 w-5" />
				</button>

				<div className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl
				                border-2 border-zinc-200 dark:border-dark-border">
					<Image src={avatarIcon} alt="User avatar" className="h-full w-full" />
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
