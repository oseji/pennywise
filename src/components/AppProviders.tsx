"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useAuthStore } from "@/store/useAuthStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
	const hydrateFromStorage = usePreferencesStore((s) => s.hydrateFromStorage);
	const subscribeToAuth = useAuthStore((s) => s.subscribe);

	useEffect(() => {
		hydrateFromStorage();
	}, [hydrateFromStorage]);

	useEffect(() => subscribeToAuth(), [subscribeToAuth]);

	return <>{children}</>;
}
