"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/store/usePreferencesStore";

export function AppProviders({ children }: { children: React.ReactNode }) {
	const hydrateFromStorage = usePreferencesStore((s) => s.hydrateFromStorage);

	useEffect(() => {
		hydrateFromStorage();
	}, [hydrateFromStorage]);

	return <>{children}</>;
}
