"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Toaster } from "react-hot-toast";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useAuthStore } from "@/store/useAuthStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
	const hydrateFromStorage = usePreferencesStore((s) => s.hydrateFromStorage);
	const subscribeToAuth = useAuthStore((s) => s.subscribe);

	useEffect(() => {
		hydrateFromStorage();
	}, [hydrateFromStorage]);

	useEffect(() => subscribeToAuth(), [subscribeToAuth]);

	return (
		// "user": motion components drop transform/layout animation under
		// prefers-reduced-motion; components add their own reduced alternatives on top.
		<MotionConfig reducedMotion="user">
			<Toaster
				position="top-center"
				gutter={8}
				toastOptions={{
					duration: 3500,
					className:
						"!rounded-[4px] !bg-paper !text-ink !shadow-lift !font-sans !text-[14px] !px-3 !py-2.5 dark:!ring-1 dark:!ring-rule",
					success: { iconTheme: { primary: "rgb(var(--pos))", secondary: "rgb(var(--paper))" } },
					error: { iconTheme: { primary: "rgb(var(--neg))", secondary: "rgb(var(--paper))" } },
				}}
			/>
			{children}
		</MotionConfig>
	);
}
