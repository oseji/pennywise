"use client";

import { useState } from "react";

// Routes that have already printed this session. Coming back to a page shows
// it already on the counter; motion is reserved for data that changes.
const printed = new Set<string>();

export function usePrintOnce(key: string) {
	const [play] = useState(() => {
		const first = !printed.has(key);
		printed.add(key);
		return first;
	});
	return play;
}
