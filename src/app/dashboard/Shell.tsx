"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useUiStore } from "@/store/useUiStore";
import { readSampleMode } from "@/lib/finance/sampleMode";
import { Rail } from "@/components/shell/Rail";
import { KeypadBar } from "@/components/shell/KeypadBar";
import { TopBar } from "@/components/shell/TopBar";
import { MoreSheet } from "@/components/shell/MoreSheet";
import { SampleDataToggle } from "@/components/shell/SampleDataToggle";
import { RingUp } from "@/components/ringup/RingUp";
import Notifications from "./Notifications";

/** Starts the data session once auth resolves; signed-out visitors go back to the login screen. */
function FinanceLoader() {
	const router = useRouter();
	const { user, initialized } = useAuthStore();
	const start = useFinanceStore((s) => s.start);

	useEffect(() => {
		// sample data needs no session, so it doesn't wait on auth
		const sample = readSampleMode();
		if (sample) {
			start(null, sample);
			return;
		}
		if (!initialized) return;
		if (!user) {
			router.replace("/");
			return;
		}
		start(user.uid, null);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- restart on session change only
	}, [initialized, user?.uid]);

	return null;
}

/** "N" rings up an entry from anywhere, unless the user is typing or a dialog is open. */
function useRingUpShortcut() {
	const openRingUp = useUiStore((s) => s.openRingUp);
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "n" && e.key !== "N") return;
			if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
			const t = e.target as HTMLElement | null;
			if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
			if (document.querySelector('[role="dialog"]')) return;
			e.preventDefault();
			openRingUp();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [openRingUp]);
}

export function Shell({ children }: { children: React.ReactNode }) {
	useRingUpShortcut();

	return (
		<div className="min-h-dvh bg-ground">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-[8px] focus:bg-key focus:px-4 focus:py-2.5 focus:font-mono focus:text-[12px] focus:font-semibold focus:uppercase focus:text-white"
			>
				Skip to content
			</a>

			<Rail />

			<div className="min-w-0 lg:pl-64">
				<TopBar />
				<Notifications />
				<main id="main-content" tabIndex={-1} className="pb-28 outline-none lg:pb-12">
					{children}
				</main>
			</div>

			<KeypadBar />
			<MoreSheet />
			<RingUp />
			<FinanceLoader />
			{process.env.NODE_ENV === "development" && <SampleDataToggle />}
		</div>
	);
}
