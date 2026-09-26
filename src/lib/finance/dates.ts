// The entry timestamp format every list has always shown ("26 Sept 2026, 06:04 pm").
export const formatStamp = (d: Date): string =>
	d.toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});

export const dayKey = (d: Date) =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const formatDayHeading = (d: Date, now = new Date()): string => {
	const today = dayKey(now);
	const y = new Date(now);
	y.setDate(now.getDate() - 1);
	const k = dayKey(d);
	if (k === today) return "Today";
	if (k === dayKey(y)) return "Yesterday";
	return d.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
	});
};

export const formatTime = (d: Date): string =>
	d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
